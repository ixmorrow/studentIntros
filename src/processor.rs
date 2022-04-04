use solana_program::{
    log::sol_log_compute_units,
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    msg,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
    system_program::ID as SYSTEM_PROGRAM_ID,
    system_instruction,
    program::{invoke_signed},
    program_pack::{IsInitialized, Pack},
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::{instruction::IntroInstruction, state::StudentInfo};
use crate::{error::IntroError};



pub struct Processor;

pub fn assert_with_msg(statement: bool, err: ProgramError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(err)
    } else {
        Ok(())
    }
}
fn assert_uninitialized<T: Pack + IsInitialized>(
    account_info: &AccountInfo,
) -> Result<T, ProgramError> {
    let account: T = T::unpack_unchecked(&account_info.data.borrow())?;
    if account.is_initialized() {
        Err(IntroError::AlreadyInitialized.into())
    } else {
        Ok(account)
    }
}

impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        sol_log_compute_units();
        let instruction = IntroInstruction::unpack(instruction_data)?;

        let account_info_iter = &mut accounts.iter();
        match instruction {
            IntroInstruction::Initialize => {
                msg!("Instruction: Initialize");

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
            //user.test_input = 1;
            //msg!("initialized user account data: {}", user.test_input);
            //msg!("user input: {}", input);
            user.serialize(&mut *user_account.data.borrow_mut())?;

            sol_log_compute_units();
        }
        IntroInstruction::InitializeUserInput (input)  => {
            msg!("Initialize with user input");

            let account_info_iter = &mut accounts.iter();
            let initializer = next_account_info(account_info_iter)?;

            if !initializer.is_signer {
                msg!("Initializer is not signer");
                return Err(ProgramError::MissingRequiredSignature);
            }

            let user_account = next_account_info(account_info_iter)?;
            let system_program = next_account_info(account_info_iter)?;
            let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
            
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

            msg!("User name: {}", input);
            if !rent.is_exempt(user_account.lamports(), user_account.data_len()) {
                msg!("user account is not rent exempt");
                return Err(IntroError::NotRentExempt.into());
            }
            msg!("unpacking state account");
            let mut account_data = user_account.data.borrow_mut();
            msg!("borrowed account data");
            let mut user = StudentInfo::unpack_unchecked(&account_data)?;
            msg!("checking if user account is already initialized");
            if user.is_initialized() {
                msg!("Account already initialized");
                return Err(ProgramError::AccountAlreadyInitialized);
            }
            //user.is_initialized = true;
            //user.name = input;
            user.set_initialize();
            user.set_name(input);
            msg!("user data: {}", user.name);
            msg!("serializing account");
            StudentInfo::pack(user, &mut account_data)?;
            msg!("state account serialized");

            sol_log_compute_units();

        }
    }
    
    Ok(())
}}