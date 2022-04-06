const {
    Connection,
    sendAndConfirmTransaction,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
    TransactionInstruction,
    pubkey,
    SYSVAR_RENT_PUBKEY,
    LAMPORTS_PER_SOL,
    AccountData,
    AccountMeta,

  } = require("@solana/web3.js");
  import { serialize, deserialize, deserializeUnchecked } from 'borsh';
  import { Buffer } from 'buffer';

  const BN = require('BN.js'); 

  const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
  const commitment = 'confirmed';
  const connection = new Connection(RPC_ENDPOINT_URL, commitment);
  const program_id = new PublicKey("6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr");

  // MY WALLET SETTING
  const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
  //const id_json_path = require('os').homedir() + "/.config/solana/my-keypair.json";
  //const id_json_path = require('os').homedir() + "/.config/solana/id.json";
  const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
  const wallet = Keypair.fromSecretKey(secret as Uint8Array);

  const feePayer = Keypair.generate();

  const userInputIx = (i: Buffer, user: typeof PublicKey, userInfo: typeof PublicKey) => {
    return new TransactionInstruction({
      keys: [
        {
          pubkey: user,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: userInfo,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        }
      ],
      data: Buffer.concat([Buffer.from(new Uint8Array([0])), i]),
      programId: program_id,
    });
  };

  // Flexible class that takes properties and imbues them
  // to the object instance
  class Assignable {
    constructor(properties) {
        Object.keys(properties).map((key) => {
            return (this[key] = properties[key]);
        });
    }
  }

  // Our instruction payload vocabulary
  class Payload extends Assignable { }
  class DeserializedAccount extends Assignable { }

  // Borsh needs a schema describing the payload
  const payloadSchema = new Map([
    [
      Payload,
      {
          kind: "struct",
          fields: [
              ["name", "string"],
          ]
      }
    ]
  ]);

  const accountSchema = new Map([
    [
        DeserializedAccount,
        {
            kind: "struct",
            fields: [
                ["initialized", "u8"],
                ["name", "string"],
            ]
        }
    ]
  ]);
  async function main(userName: string) {
    console.log("Program id: " + program_id.toBase58());
    console.log("Fee payer: " + feePayer.publicKey);

    const tx = new Transaction();

    const userInfo = (await PublicKey.findProgramAddress(
      [feePayer.publicKey.toBuffer()],
      program_id
    ))[0];
    console.log("PDA: " + userInfo);

    const payload = new Payload({
      name: userName
    });
    // Serialize the payload
    const userSerBuf = Buffer.from(serialize(payloadSchema, payload));
    console.log("Serialized data: " + userSerBuf);
    let PayloadCopy = deserialize(payloadSchema, Payload, userSerBuf);
    console.log(PayloadCopy)

    console.log("creating init instruction");
    const ix = userInputIx(userSerBuf, feePayer.publicKey, userInfo);
    tx.add(ix);

    if ((await connection.getBalance(feePayer.publicKey)) < 1.0) {
      console.log("Requesting Airdrop of 1 SOL...");
      await connection.requestAirdrop(feePayer.publicKey, 2e9);
      console.log("Airdrop received");
    }

    let signers = [feePayer];

    console.log("sending tx");
    let txid = await sendAndConfirmTransaction(connection, tx, signers, {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    });
    console.log("tx signature " + txid);
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

    // sleep to allow time to update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userAccount = await connection.getAccountInfo(
      userInfo
    );

    if (userAccount === null || userAccount.data.length === 0) {
      console.log("User state account has not been initialized properly");
      process.exit(1);
    }
    else{
      console.log(userAccount.data);
    }


  }

  const msg = "hello my name is Ivan. Im currently learning solana development and loving every minute of it! Sol is going to the moon!! I'm not sure what else to write, this needs to be 180 char"
  const msg1 = "hey this is another test";
  main(msg1)
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });