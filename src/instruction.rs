use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{program_error::ProgramError, borsh::try_from_slice_unchecked};
use crate::error::IntroError::InstructionUnpackError;


#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum IntroInstruction {
    InitUserInput {
        name: String,
        message: String,
    }
}

#[derive(BorshDeserialize, Debug)]
struct PostIxPayload {
    name: String,
    message: String,
}

impl IntroInstruction {
     /// Unpack inbound buffer to associated Instruction
    /// The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (variant, rest) = input.split_first().ok_or(InstructionUnpackError)?;
        let payload = PostIxPayload::try_from_slice(rest).unwrap();

        Ok(match variant {
            0 => Self::InitUserInput {
                name: payload.name,
                message: payload.message
            },
            _ => return Err(InstructionUnpackError.into()),
        })
    }
}