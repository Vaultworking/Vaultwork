#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol, Vec, Map};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidAddress = 1,
    InvalidToken = 2,
    InvalidArbiter = 3,
    NoMilestones = 4,
    ArrayLengthMismatch = 5,
    IndexOutOfBounds = 6,
    NotOwner = 7,
}

#[contracttype]
#[derive(Clone)]
pub struct ProjectData {
    pub escrow_address: Address,
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub arbiter: Address,
    pub total_amount: i128,
    pub milestone_count: u32,
    pub review_window_seconds: u64,
}

#[contract]
pub struct EscrowFactory;

#[contractimpl]
impl EscrowFactory {
    pub fn __constructor(env: Env, owner: Address) {
        env.storage().instance().set(&Symbol::short("owner"), &owner);
        env.storage().instance().set(&Symbol::short("escrow_count"), &0u32);
    }

    pub fn create_project(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        arbiter: Address,
        milestone_amounts: Vec<i128>,
        milestone_descriptions: Vec<String>,
        review_window_seconds: u64,
    ) -> Result<Address, Error> {
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

        let mut total_amount: i128 = 0;
        for amount in milestone_amounts.iter() {
            total_amount += amount;
        }

        // In Stellar, we would deploy the escrow contract here
        // For now, we'll use a placeholder address
        let escrow_address = client.clone();

        let project_data = ProjectData {
            escrow_address: escrow_address.clone(),
            client: client.clone(),
            freelancer: freelancer.clone(),
            token,
            arbiter,
            total_amount,
            milestone_count: milestone_amounts.len() as u32,
            review_window_seconds,
        };

        let escrow_count: u32 = env.storage().instance().get(&Symbol::short("escrow_count")).unwrap_or(0);
        env.storage().instance().set(&Symbol::short("escrow_count"), &(escrow_count + 1));

        // Store by client
        let client_key = Symbol::short(&format!("client_{}", client.to_string()));
        let mut client_escrows: Vec<Address> = env.storage().instance().get(&client_key).unwrap_or(Vec::new(&env));
        client_escrows.push_back(escrow_address.clone());
        env.storage().instance().set(&client_key, &client_escrows);

        // Store by freelancer
        let freelancer_key = Symbol::short(&format!("freelancer_{}", freelancer.to_string()));
        let mut freelancer_escrows: Vec<Address> = env.storage().instance().get(&freelancer_key).unwrap_or(Vec::new(&env));
        freelancer_escrows.push_back(escrow_address.clone());
        env.storage().instance().set(&freelancer_key, &freelancer_escrows);

        // Store all escrows
        let all_key = Symbol::short("all_escrows");
        let mut all_escrows: Vec<Address> = env.storage().instance().get(&all_key).unwrap_or(Vec::new(&env));
        all_escrows.push_back(escrow_address.clone());
        env.storage().instance().set(&all_key, &all_escrows);

        // Store project data
        let project_key = Symbol::short(&format!("project_{}", escrow_address.to_string()));
        env.storage().instance().set(&project_key, &project_data);

        env.events().publish(
            (Symbol::short("project_created"), client, freelancer),
            (escrow_address.clone(), total_amount, milestone_amounts.len() as u32, review_window_seconds, env.ledger().timestamp()),
        );

        Ok(escrow_address)
    }

    pub fn get_escrows_by_client(env: Env, client: Address) -> Result<Vec<Address>, Error> {
        let client_key = Symbol::short(&format!("client_{}", client.to_string()));
        env.storage().instance().get(&client_key).ok_or(Error::InvalidAddress)
    }

    pub fn get_escrows_by_freelancer(env: Env, freelancer: Address) -> Result<Vec<Address>, Error> {
        let freelancer_key = Symbol::short(&format!("freelancer_{}", freelancer.to_string()));
        env.storage().instance().get(&freelancer_key).ok_or(Error::InvalidAddress)
    }

    pub fn escrow_count(env: Env) -> u32 {
        env.storage().instance().get(&Symbol::short("escrow_count")).unwrap_or(0)
    }

    pub fn get_all_escrows(env: Env) -> Vec<Address> {
        env.storage().instance().get(&Symbol::short("all_escrows")).unwrap_or(Vec::new(&env))
    }

    pub fn get_project(env: Env, escrow_address: Address) -> Result<ProjectData, Error> {
        let project_key = Symbol::short(&format!("project_{}", escrow_address.to_string()));
        env.storage().instance().get(&project_key).ok_or(Error::InvalidAddress)
    }

    pub fn transfer_ownership(env: Env, current_owner: Address, new_owner: Address) -> Result<(), Error> {
        let owner: Address = env.storage().instance().get(&Symbol::short("owner")).ok_or(Error::NotOwner)?;
        
        if owner != current_owner {
            return Err(Error::NotOwner);
        }
        if new_owner.is_none() {
            return Err(Error::InvalidAddress);
        }

        env.storage().instance().set(&Symbol::short("owner"), &new_owner);

        env.events().publish(
            (Symbol::short("ownership_transferred"), current_owner),
            new_owner,
        );

        Ok(())
    }

    pub fn get_owner(env: Env) -> Address {
        env.storage().instance().get(&Symbol::short("owner")).unwrap()
    }
}

mod test;
