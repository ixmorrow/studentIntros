# Student Intros
This program is currently deployed on the Solana Devnet at [Program ID: 6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr](https://explorer.solana.com/address/6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr?cluster=devnet)

The purpose of this program is to allow students to provide an intro about themselves with info like how long they have been a dev, how/why they got into solana, and what they expect to get out of the course. 

In the program's current implementation, there is no hard coded limit to the size of the PDA that will hold the student's data. In the script I have attached, I limit the buffer passed in to 1000 bytes and then just slice off whatever is not used less than 1000. The program creates an account with enough space to store whatever is passed in. Probably will want to put a limit on this somewhere on the front-end.

## Testing
To run the testing script, you will have to 'NPM Install' the dependencies and then run the js file with 'node exampleStudentIntroV2.js'

If you make changes to the ts file, then you will have re-compile it to js with the command 'npx tsc' and then follow the step above to run the newly compiled js file.

## Program Updates
The program is currently deployed to devnet. If we want to make changes to the program side code either I will have to implement these changes and then re-deploy the program to the same program id or someone else can make the changes and deploy them to a new program id. Only the initial author has the authority to push updates to a program at a specific program id.
