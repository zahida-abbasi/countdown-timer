import { differenceInSeconds, addSeconds } from 'date-fns';
import inquirer from 'inquirer';

// Prompt user for hours, minutes, and seconds
const askForTime = async () => {
  const res = await inquirer.prompt([
    {
      type: 'number',
      name: 'hours',
      message: 'Please enter hours',
      validate: (input) => {
        return !isNaN(input) && input >= 0 ? true : 'Please enter a valid number';
      }
    },
    {
      type: 'number',
      name: 'minutes',
      message: 'Please enter minutes',
      validate: (input) => {
        return !isNaN(input) && input >= 0 && input < 60 ? true : 'Minutes must be between 0 and 59';
      }
    },
    {
      type: 'number',
      name: 'seconds',
      message: 'Please enter seconds',
      validate: (input) => {
        return !isNaN(input) && input >= 0 && input < 60 ? true : 'Seconds must be between 0 and 59';
      }
    }
  ]);

  return res;
};

let interval: NodeJS.Timeout | null = null;
let remainingSeconds: number;
let endTime: Date | null = null;

// Start the countdown timer
const startCountdown = (totalSeconds: number) => {
  remainingSeconds = totalSeconds;
  endTime = addSeconds(new Date(), remainingSeconds);

  interval = setInterval(() => {
    const currentTime = new Date();
    const timeDiff = differenceInSeconds(endTime!, currentTime);
    remainingSeconds = timeDiff;

    if (timeDiff <= 0) {
      console.log('Timer has expired');
      clearInterval(interval!);
      process.exit();
    }

    const hours = Math.floor(timeDiff / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const seconds = timeDiff % 60;

    console.log(`${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`);
  }, 1000);
};

// Pause the countdown timer
const pauseCountdown = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log('Timer paused');
  }
};

// Resume the countdown timer
const resumeCountdown = () => {
  if (!interval) {
    endTime = addSeconds(new Date(), remainingSeconds);
    startCountdown(remainingSeconds);
    console.log('Timer resumed');
  }
};

// Stop the countdown timer
const stopCountdown = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log('Timer stopped');
    process.exit();
  }
};

// Prompt user for commands
const askForCommand = async () => {
  const res = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'What would you like to do?',
      choices: ['Pause', 'Resume', 'Stop'],
    }
  ]);

  const command = res.command;

  switch (command) {
    case 'Pause':
      pauseCountdown();
      break;
    case 'Resume':
      resumeCountdown();
      break;
    case 'Stop':
      stopCountdown();
      break;
  }

  await askForCommand();
};

// Main function to execute the program
const main = async () => {
  const { hours, minutes, seconds } = await askForTime();
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  console.log(`Starting countdown for ${hours} hours, ${minutes} minutes, and ${seconds} seconds...`);
  startCountdown(totalSeconds);

  await askForCommand();
};

main().catch((error) => {
  console.error('Error:', error);
});
