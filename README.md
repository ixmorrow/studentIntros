# Student Intros
This program is currently deployed on the Solana Devnet at Program ID: 6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr

The purpose of this program is to allow students to provide an intro about themselves with info like how long they have been a dev, how/why they got into solana, and what they expect to get out of the course. 

In the program's current implementation, only the first 128 characters of the string passed in as input will be encoded to the state account. If the message is less than 128 characters, the program will pad the buffer with 0's until it is the desired 128 bytes long.

## Testing
To run the testing script, you will have to 'NPM Install' the dependencies and then run the js file with 'node exampleStudentIntroV2.js'

If you make changes to the ts file, then you will have re-compile it to js with the command 'npx tsc'.

## Program Updates
The program is currently deployed to devnet. If we want to make changes to the program side code either I will have to implement these changes and then re-deploy the program to the same program id or someone else can make the changes and deploy them to a new program id. Only the initial author has the authority to push updates to a program at a specific program id.
