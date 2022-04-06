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
    program_pack::{IsInitialized},
};
use crate::{instruction::IntroInstruction, state::StudentInfo};
use crate::{error::IntroError};
use std::io::Write;
use borsh::{ BorshDeserialize, BorshSerialize };


pub struct Processor;

pub fn assert_with_msg(statement: bool, err: ProgramError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(err)
    } else {
        Ok(())
    }
}

fn fill_from_str(mut bytes: &mut [u8], s: &[u8]) {
    bytes.write(s).unwrap();
}

impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        sol_log_compute_units();
        let instruction = IntroInstruction::unpack(instruction_data)?;
        const SIZE: usize = 128;

        let account_info_iter = &mut accounts.iter();
        match instruction {
        IntroInstruction::InitializeUserInput (input)  => {
            msg!("Initialize with user input");
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
                    Rent::get()?.minimum_balance(129),
                    129,
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

            msg!("User intro: {}", input);
            if !rent.is_exempt(user_account.lamports(), user_account.data_len()) {
                msg!("user account is not rent exempt");
                return Err(IntroError::NotRentExempt.into());
            }
            msg!("unpacking state account");
            let mut account_data = user_account.data.borrow_mut();
            msg!("borrowed account data");
            let mut user = StudentInfo::try_from_slice(&account_data)?;

            let data = instruction_data;
            //let n = instruction_data.len();
            let mut bytes: [u8; SIZE] = [0; SIZE];
            if instruction_data.len() >= SIZE {
                user.msg.clone_from_slice(&data[0..SIZE]);
            }
            else {
                fill_from_str(&mut bytes,data);
                user.msg.clone_from_slice(&bytes[0..SIZE]);
            }
            msg!("checking if user account is already initialized");
            if user.is_initialized() {
                msg!("Account already initialized");
                return Err(ProgramError::AccountAlreadyInitialized);
            }

            user.is_initialized = true;
            msg!("user intro: {:?}", user.msg);
            msg!("serializing account");
            user.serialize(&mut &mut account_data[..])?;
            msg!("state account serialized");

            sol_log_compute_units();

        }
    }
    
    Ok(())
}}