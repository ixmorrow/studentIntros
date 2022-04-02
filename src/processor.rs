use solana_program::{
    log::sol_log_compute_units,
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    msg,
    pubkey::Pubkey,
    program_pack::{Pack, IsInitialized},
    sysvar::{rent::Rent, Sysvar},
    system_program::ID as SYSTEM_PROGRAM_ID,
    system_instruction,
    program::{invoke_signed},
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::{instruction::IntroInstruction, state::StudentInfo};


pub struct Processor;

pub fn assert_with_msg(statement: bool, err: ProgramError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(err)
    } else {
        Ok(())
    }
}

impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        sol_log_compute_units();

        let instruction = IntroInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

        let accounts_iter = &mut accounts.iter();
        match instruction {
            IntroInstruction::Initialize => {
                msg!("Instruction: Initialize");

            let account_info_iter = &mut accounts.iter();
            let initializer = next_account_info(account_info_iter)?;

            if !initializer.is_signer {
                msg!("Initializer is not signer");
                return Err(ProgramError::MissingRequiredSignature);
            }

            let user_account = next_account_info(account_info_iter)?;
            let system_program = next_account_info(account_info_iter)?;
        
            msg!("finding pda");
            let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(),], program_id);
            msg!("pda: {}", pda);

            msg!("initializing account at pda");
            invoke_signed(
                    &system_instruction::create_account(
                    initializer.key,
                    user_account.key,
                    Rent::get()?.minimum_balance(8),
                    8,
                    program_id,
                ),
                &[initializer.clone(), user_account.clone(), system_program.clone()],
                &[&[initializer.key.as_ref(), &[bump_seed]]],
            )?;

            assert_with_msg(
                *system_program.key == SYSTEM_PROGRAM_ID,
                ProgramError::InvalidArgument,
                "Invalid passed in for system program",
            )?;
            assert_with_msg(
                pda == *user_account.key,
                ProgramError::InvalidArgument,
                "Invalid PDA seeds for user account",
            )?;

            let mut user = StudentInfo::try_from_slice(&user_account.data.borrow())?;
            user.test_data = 1;
            msg!("initialized user account data: {}", user.test_data);
            //msg!("user input: {}", input);
            user.serialize(&mut *user_account.data.borrow_mut())?;

            sol_log_compute_units();
        }
        IntroInstruction::InitializeUserInput { input } => {
            msg!("Initialize with user input");

            let account_info_iter = &mut accounts.iter();
            let initializer = next_account_info(account_info_iter)?;

            if !initializer.is_signer {
                msg!("Initializer is not signer");
                return Err(ProgramError::MissingRequiredSignature);
            }

            let user_account = next_account_info(account_info_iter)?;
            let system_program = next_account_info(account_info_iter)?;
            
            msg!("finding pda");
            let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(),], program_id);
            msg!("pda: {}", pda);

            msg!("initializing account at pda");
            invoke_signed(
                    &system_instruction::create_account(
                    initializer.key,
                    user_account.key,
                    Rent::get()?.minimum_balance(8),
                    8,
                    program_id,
                ),
                &[initializer.clone(), user_account.clone(), system_program.clone()],
                &[&[initializer.key.as_ref(), &[bump_seed]]],
            )?;

            assert_with_msg(
                *system_program.key == SYSTEM_PROGRAM_ID,
                ProgramError::InvalidArgument,
                "Invalid passed in for system program",
            )?;
            assert_with_msg(
                pda == *user_account.key,
                ProgramError::InvalidArgument,
                "Invalid PDA seeds for user account",
            )?;

            let mut user = StudentInfo::try_from_slice(&user_account.data.borrow())?;
            user.test_data = input;
            msg!("initialized user account data with input: {}", user.test_data);
            user.serialize(&mut *user_account.data.borrow_mut())?;

            sol_log_compute_units();

        }
    }
    
    Ok(())
}}