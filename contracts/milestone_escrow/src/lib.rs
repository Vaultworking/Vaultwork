#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol, Vec, Map, U256Val};

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
    pub description: String,
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

#[contract]
pub struct MilestoneEscrow;

#[contractimpl]
impl MilestoneEscrow {
    pub fn initialize(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        arbiter: Address,
        milestone_amounts: Vec<i128>,
        milestone_descriptions: Vec<String>,
        review_window_seconds: u64,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&Symbol::short("init")) {
            return Err(Error::AlreadyInitialized);
        }
        
        if client.is_none() {
            return Err(Error::InvalidAddress);
        }
        if freelancer.is_none() {
            return Err(Error::InvalidAddress);
        }
        if token.is_none() {
            return Err(Error::InvalidToken);
        }
        if arbiter.is_none() {
            return Err(Error::InvalidArbiter);
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
        let milestones: Vec<Milestone> = milestone_amounts
            .iter()
            .zip(milestone_descriptions.iter())
            .enumerate()
            .map(|(i, (amount, desc))| {
                if *amount <= 0 {
                    panic!("Milestone amount must be positive");
                }
                total_amount += amount;
                Milestone {
                    amount: *amount,
                    description: desc.clone(),
                    state: MilestoneState::Pending,
                    delivery_timestamp: 0,
                }
            })
            .collect();

        let data = DataKey {
            client: client.clone(),
            freelancer: freelancer.clone(),
            token: token.clone(),
            arbiter: arbiter.clone(),
            review_window_seconds,
            total_escrow_amount: total_amount,
            is_funded: false,
        };

        env.storage().instance().set(&Symbol::short("init"), &true);
        env.storage().instance().set(&Symbol::short("data"), &data);
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        Ok(())
    }

    pub fn fund(env: Env, client: Address, token: Address) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            return Err(Error::NotClient);
        }
        if data.is_funded {
            return Err(Error::AlreadyFunded);
        }
        if data.token != token {
            return Err(Error::InvalidToken);
        }

        // Token transfer would be handled via cross-contract call
        // For now, we'll mark as funded
        let mut updated_data = data;
        updated_data.is_funded = true;
        env.storage().instance().set(&Symbol::short("data"), &updated_data);

        env.events().publish(
            (Symbol::short("funded"), client),
            (data.total_escrow_amount, env.ledger().sequence()),
        );

        Ok(())
    }

    pub fn mark_delivered(env: Env, freelancer: Address, milestone_index: u32) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.freelancer != freelancer {
            return Err(Error::NotClient);
        }
        if !data.is_funded {
            return Err(Error::NotFunded);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if milestone_index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        if milestones[milestone_index as usize].state != MilestoneState::Pending {
            return Err(Error::MilestoneNotPending);
        }

        milestones[milestone_index as usize].state = MilestoneState::Delivered;
        milestones[milestone_index as usize].delivery_timestamp = env.ledger().timestamp();
        
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        env.events().publish(
            (Symbol::short("delivered"), milestone_index, freelancer),
            env.ledger().timestamp(),
        );

        Ok(())
    }

    pub fn approve(env: Env, client: Address, milestone_index: u32) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if milestone_index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        if milestones[milestone_index as usize].state != MilestoneState::Delivered {
            return Err(Error::MilestoneNotDelivered);
        }

        // Token transfer would be handled via cross-contract call
        milestones[milestone_index as usize].state = MilestoneState::Released;
        
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        env.events().publish(
            (Symbol::short("approved"), milestone_index, client),
            (milestones[milestone_index as usize].amount, env.ledger().timestamp()),
        );

        Ok(())
    }

    pub fn raise_dispute(env: Env, client: Address, milestone_index: u32) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if milestone_index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        if milestones[milestone_index as usize].state != MilestoneState::Delivered {
            return Err(Error::MilestoneNotDelivered);
        }

        let delivery_time = milestones[milestone_index as usize].delivery_timestamp;
        let current_time = env.ledger().timestamp();
        
        if current_time >= delivery_time + data.review_window_seconds {
            return Err(Error::ReviewWindowExpired);
        }

        milestones[milestone_index as usize].state = MilestoneState::Disputed;
        
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        env.events().publish(
            (Symbol::short("disputed"), milestone_index, client),
            env.ledger().timestamp(),
        );

        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        arbiter: Address,
        milestone_index: u32,
        client_bps: u32,
    ) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.arbiter != arbiter {
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if milestone_index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        if milestones[milestone_index as usize].state != MilestoneState::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }

        if client_bps > 10000 {
            return Err(Error::InvalidBasisPoints);
        }

        let amount = milestones[milestone_index as usize].amount;
        let client_amount = (amount * client_bps as i128) / 10000;
        let freelancer_amount = amount - client_amount;

        // Token transfers would be handled via cross-contract calls
        milestones[milestone_index as usize].state = MilestoneState::Resolved;
        
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        env.events().publish(
            (Symbol::short("resolved"), milestone_index, arbiter),
            (client_amount, freelancer_amount, env.ledger().timestamp()),
        );

        Ok(())
    }

    pub fn claim_after_timeout(env: Env, freelancer: Address, milestone_index: u32) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.freelancer != freelancer {
            return Err(Error::NotClient);
        }

        let mut milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if milestone_index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        if milestones[milestone_index as usize].state != MilestoneState::Delivered {
            return Err(Error::MilestoneNotDelivered);
        }

        let delivery_time = milestones[milestone_index as usize].delivery_timestamp;
        let current_time = env.ledger().timestamp();
        
        if current_time < delivery_time + data.review_window_seconds {
            return Err(Error::ReviewWindowNotExpired);
        }

        // Token transfer would be handled via cross-contract call
        milestones[milestone_index as usize].state = MilestoneState::Released;
        
        env.storage().instance().set(&Symbol::short("milestones"), &milestones);

        env.events().publish(
            (Symbol::short("released"), milestone_index, freelancer),
            (milestones[milestone_index as usize].amount, env.ledger().timestamp()),
        );

        Ok(())
    }

    pub fn cancel_unfunded_project(env: Env, client: Address) -> Result<(), Error> {
        let data: DataKey = env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)?;
        
        if data.client != client {
            return Err(Error::NotClient);
        }
        if data.is_funded {
            return Err(Error::AlreadyFunded);
        }

        let milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        for milestone in milestones.iter() {
            if milestone.state != MilestoneState::Pending {
                return Err(Error::ProjectAlreadyStarted);
            }
        }

        env.events().publish(
            (Symbol::short("cancelled"), client),
            env.ledger().timestamp(),
        );

        Ok(())
    }

    // View functions
    pub fn get_data(env: Env) -> Result<DataKey, Error> {
        env.storage().instance().get(&Symbol::short("data"))
            .ok_or(Error::AlreadyInitialized)
    }

    pub fn get_milestones(env: Env) -> Result<Vec<Milestone>, Error> {
        env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)
    }

    pub fn get_milestone(env: Env, index: u32) -> Result<Milestone, Error> {
        let milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        if index as usize >= milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }
        
        Ok(milestones[index as usize].clone())
    }

    pub fn milestone_count(env: Env) -> Result<u32, Error> {
        let milestones: Vec<Milestone> = env.storage().instance().get(&Symbol::short("milestones"))
            .ok_or(Error::NoMilestones)?;
        
        Ok(milestones.len() as u32)
    }
}

mod test;
