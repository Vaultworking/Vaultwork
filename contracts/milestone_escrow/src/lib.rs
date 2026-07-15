#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Vec, symbol_short, String as SorobanString, token};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    InvalidAddress = 2,
    InvalidToken = 3,
    InvalidArbiter = 4,
    NoMilestones = 5,
    ArrayLengthMismatch = 6,
    InvalidReviewWindow = 7,
    NotClient = 8,
    AlreadyFunded = 9,
    NotFunded = 10,
    InvalidMilestoneIndex = 11,
    MilestoneNotPending = 12,
    MilestoneNotDelivered = 13,
    ReviewWindowExpired = 14,
    MilestoneNotDisputed = 15,
    InvalidBasisPoints = 16,
    ReviewWindowNotExpired = 17,
    ProjectAlreadyStarted = 18,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneState {
    Pending = 0,
    Delivered = 1,
    Approved = 2,
    Disputed = 3,
    Resolved = 4,
    Released = 5,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub amount: i128,
    pub description: SorobanString,
    pub state: MilestoneState,
    pub delivery_timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct DataKey {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub arbiter: Address,
    pub review_window_seconds: u64,
    pub total_escrow_amount: i128,
    pub is_funded: bool,
}

#[contracttype]
#[derive(Copy, Clone, PartialEq)]
pub enum ReentrancyGuard {
    Unlocked = 0,
    Locked = 1,
}

#[contract]
pub struct MilestoneEscrow;

#[contractimpl]
impl MilestoneEscrow {
    fn lock_guard(env: &Env) {
        let guard: ReentrancyGuard = env.storage().instance().get(&symbol_short!("guard")).unwrap_or(ReentrancyGuard::Unlocked);
        if guard == ReentrancyGuard::Locked {
            panic!("Reentrancy detected");
        }
        env.storage().instance().set(&symbol_short!("guard"), &ReentrancyGuard::Locked);
    }

    fn unlock_guard(env: &Env) {
        env.storage().instance().set(&symbol_short!("guard"), &ReentrancyGuard::Unlocked);
    }

    pub fn initialize(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        arbiter: Address,
        milestone_amounts: Vec<i128>,
        milestone_descriptions: Vec<SorobanString>,
        review_window_seconds: u64,
    ) -> Result<(), Error> {
        client.require_auth();
        
        if env.storage().instance().has(&symbol_short!("init")) {
            return Err(Error::AlreadyInitialized);
        }
        
        if milestone_amounts.is_empty() {
            return Err(Error::NoMilestones);
        }
        if milestone_amounts.len() != milestone_descriptions.len() {
            return Err(Error::ArrayLengthMismatch);
        }
        if review_window_seconds == 0 {
            return Err(Error::InvalidReviewWindow);
        }

        let mut total_amount: i128 = 0;
        let milestones: Vec<Milestone> = {
            let mut result = Vec::new(&env);
            for i in 0..milestone_amounts.len() {
                let amount = milestone_amounts.get(i).unwrap();
                let desc = milestone_descriptions.get(i).unwrap();
                if amount <= 0 {
                    panic!("Milestone amount must be positive");
                }
                total_amount += amount;
                result.push_back(Milestone {
                    amount,
                    description: desc.clone(),
                    state: MilestoneState::Pending,
                    delivery_timestamp: 0,
                });
            }
            result
        };

        let data = DataKey {
            client: client.clone(),
            freelancer: freelancer.clone(),
            token: token.clone(),
            arbiter: arbiter.clone(),
            review_window_seconds,
            total_escrow_amount: total_amount,
            is_funded: false,
        };

        env.storage().instance().set(&symbol_short!("init"), &true);
        env.storage().instance().set(&symbol_short!("data"), &data);
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        Ok(())
    }

    pub fn fund(env: Env, client: Address, token: Address) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        client.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }
        if data.is_funded {
            Self::unlock_guard(&env);
            return Err(Error::AlreadyFunded);
        }
        if data.token != token {
            Self::unlock_guard(&env);
            return Err(Error::InvalidToken);
        }

        // Transfer tokens from client to contract
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &contract_address, &data.total_escrow_amount);

        let mut updated_data = data.clone();
        updated_data.is_funded = true;
        env.storage().instance().set(&symbol_short!("data"), &updated_data);

        env.events().publish(
            (symbol_short!("funded"), client),
            (data.total_escrow_amount, env.ledger().sequence()),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn mark_delivered(env: Env, freelancer: Address, milestone_index: u32) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        freelancer.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.freelancer != freelancer {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }
        if !data.is_funded {
            Self::unlock_guard(&env);
            return Err(Error::NotFunded);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if milestone_index >= len {
            Self::unlock_guard(&env);
            return Err(Error::InvalidMilestoneIndex);
        }
        
        let milestone = milestones.get(milestone_index).unwrap();
        if milestone.state != MilestoneState::Pending {
            Self::unlock_guard(&env);
            return Err(Error::MilestoneNotPending);
        }

        milestones.set(milestone_index, Milestone {
            amount: milestone.amount,
            description: milestone.description.clone(),
            state: MilestoneState::Delivered,
            delivery_timestamp: env.ledger().timestamp(),
        });
        
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        env.events().publish(
            (symbol_short!("delivered"), milestone_index, freelancer),
            env.ledger().timestamp(),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn approve(env: Env, client: Address, milestone_index: u32) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        client.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if milestone_index >= len {
            Self::unlock_guard(&env);
            return Err(Error::InvalidMilestoneIndex);
        }
        
        let milestone = milestones.get(milestone_index).unwrap();
        if milestone.state != MilestoneState::Delivered {
            Self::unlock_guard(&env);
            return Err(Error::MilestoneNotDelivered);
        }

        // Transfer milestone amount to freelancer
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &data.token);
        token_client.transfer(&contract_address, &data.freelancer, &milestone.amount);

        milestones.set(milestone_index, Milestone {
            amount: milestone.amount,
            description: milestone.description.clone(),
            state: MilestoneState::Released,
            delivery_timestamp: milestone.delivery_timestamp,
        });
        
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        env.events().publish(
            (symbol_short!("approved"), milestone_index, client),
            (milestone.amount, env.ledger().timestamp()),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn raise_dispute(env: Env, caller: Address, milestone_index: u32) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        caller.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        // Allow both client and freelancer to raise disputes
        if data.client != caller && data.freelancer != caller {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if milestone_index >= len {
            Self::unlock_guard(&env);
            return Err(Error::InvalidMilestoneIndex);
        }
        
        let milestone = milestones.get(milestone_index).unwrap();
        if milestone.state != MilestoneState::Delivered {
            Self::unlock_guard(&env);
            return Err(Error::MilestoneNotDelivered);
        }

        let delivery_time = milestone.delivery_timestamp;
        let current_time = env.ledger().timestamp();
        
        if current_time >= delivery_time + data.review_window_seconds {
            Self::unlock_guard(&env);
            return Err(Error::ReviewWindowExpired);
        }

        milestones.set(milestone_index, Milestone {
            amount: milestone.amount,
            description: milestone.description.clone(),
            state: MilestoneState::Disputed,
            delivery_timestamp: milestone.delivery_timestamp,
        });
        
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        env.events().publish(
            (symbol_short!("disputed"), milestone_index, caller),
            env.ledger().timestamp(),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        arbiter: Address,
        milestone_index: u32,
        client_bps: u32,
    ) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        arbiter.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.arbiter != arbiter {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if milestone_index >= len {
            Self::unlock_guard(&env);
            return Err(Error::InvalidMilestoneIndex);
        }
        
        let milestone = milestones.get(milestone_index).unwrap();
        if milestone.state != MilestoneState::Disputed {
            Self::unlock_guard(&env);
            return Err(Error::MilestoneNotDisputed);
        }

        if client_bps > 10000 {
            Self::unlock_guard(&env);
            return Err(Error::InvalidBasisPoints);
        }

        let amount = milestone.amount;
        let client_amount = (amount * client_bps as i128) / 10000;
        let freelancer_amount = amount - client_amount;

        // Transfer tokens to client and freelancer based on arbiter decision
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &data.token);
        
        if client_amount > 0 {
            token_client.transfer(&contract_address, &data.client, &client_amount);
        }
        if freelancer_amount > 0 {
            token_client.transfer(&contract_address, &data.freelancer, &freelancer_amount);
        }

        milestones.set(milestone_index, Milestone {
            amount: milestone.amount,
            description: milestone.description.clone(),
            state: MilestoneState::Resolved,
            delivery_timestamp: milestone.delivery_timestamp,
        });
        
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        env.events().publish(
            (symbol_short!("resolved"), milestone_index, arbiter),
            (client_amount, freelancer_amount, env.ledger().timestamp()),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn claim_after_timeout(env: Env, freelancer: Address, milestone_index: u32) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        freelancer.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.freelancer != freelancer {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if milestone_index >= len {
            Self::unlock_guard(&env);
            return Err(Error::InvalidMilestoneIndex);
        }
        
        let milestone = milestones.get(milestone_index).unwrap();
        if milestone.state != MilestoneState::Delivered {
            Self::unlock_guard(&env);
            return Err(Error::MilestoneNotDelivered);
        }

        let delivery_time = milestone.delivery_timestamp;
        let current_time = env.ledger().timestamp();
        
        if current_time < delivery_time + data.review_window_seconds {
            Self::unlock_guard(&env);
            return Err(Error::ReviewWindowNotExpired);
        }

        // Transfer milestone amount to freelancer after timeout
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &data.token);
        token_client.transfer(&contract_address, &data.freelancer, &milestone.amount);

        milestones.set(milestone_index, Milestone {
            amount: milestone.amount,
            description: milestone.description.clone(),
            state: MilestoneState::Released,
            delivery_timestamp: milestone.delivery_timestamp,
        });
        
        env.storage().instance().set(&symbol_short!("mstones"), &milestones);

        env.events().publish(
            (symbol_short!("released"), milestone_index, freelancer),
            (milestone.amount, env.ledger().timestamp()),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    pub fn cancel_unfunded_project(env: Env, client: Address) -> Result<(), Error> {
        Self::lock_guard(&env);
        
        client.require_auth();
        
        let data: DataKey = env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            Self::unlock_guard(&env);
            return Err(Error::NotClient);
        }
        if data.is_funded {
            Self::unlock_guard(&env);
            return Err(Error::AlreadyFunded);
        }

        let milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        for milestone in milestones.iter() {
            if milestone.state != MilestoneState::Pending {
                Self::unlock_guard(&env);
                return Err(Error::ProjectAlreadyStarted);
            }
        }

        env.events().publish(
            (symbol_short!("cancelled"), client),
            env.ledger().timestamp(),
        );

        Self::unlock_guard(&env);
        Ok(())
    }

    // View functions
    pub fn get_data(env: Env) -> Result<DataKey, Error> {
        env.storage().instance().get(&symbol_short!("data"))
            .ok_or(Error::AlreadyInitialized)
    }

    pub fn get_milestones(env: Env) -> Result<Vec<Milestone>, Error> {
        env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)
    }

    pub fn get_milestone(env: Env, index: u32) -> Result<Milestone, Error> {
        let milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        let len = milestones.len();
        if index >= len {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        Ok(milestones.get(index).unwrap().clone())
    }

    pub fn milestone_count(env: Env) -> Result<u32, Error> {
        let milestones: Vec<Milestone> = env.storage().instance().get(&symbol_short!("mstones"))
            .ok_or(Error::NoMilestones)?;
        
        Ok(milestones.len())
    }
}

mod test;
