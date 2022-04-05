# Student Intros
This program is currently deployed on the Solana Devnet at Program ID: 6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr

The purpose of this program is to allow students to provide an intro about themselves with info like how long they have been a dev, how/why they got into solana, and what they expect to get out of the course. 

In the program's current implementation, the input provided by the user has to be exactly 180 characters in order for it to be encoded into the state on-chain. I chose 180 characters arbitrarily because that's how long a tweet is - we can change this to whatever we want.

To make this program more robust, can add functionality so that it can handle input less than 180 characters if we want or we can enforce this on the client/front-end side.

## Testing
To run the testing script, you will have to 'NPM Install' the dependencies and then run the js file with 'node exampleStudentIntroV2.js'

If you make changes to the ts file, then you will have re-compile it to js with the command 'npx tsc'.

## Program Updates
The program is currently deployed to devnet. If we want to make changes to the program side code either I will have to implement these changes and then re-deploy the program to the same program id or someone else can make the changes and deploy them to a new program id. Only the initial author has the authority to push updates to a program at a specific program id.
