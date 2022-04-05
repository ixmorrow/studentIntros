use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{program_error::ProgramError, borsh::try_from_slice_unchecked};
use std::{mem::size_of};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum IntroInstruction {
    InitializeUserInput ( String ),
}

impl IntroInstruction {
     /// Unpack inbound buffer to associated Instruction
    /// The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let payload = try_from_slice_unchecked::<IntroInstruction>(input).unwrap();
        match payload {
            IntroInstruction::InitializeUserInput(_) => Ok(payload)
        }
    }

    /// Packs a [Instruction] into a byte buffer.
    pub fn pack(self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match &self {
            Self::InitializeUserInput (input )=> {
                buf.push(0);
                buf.extend_from_slice(&input.clone().into_bytes());
            }
        }
        buf
    }
}