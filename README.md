# fc-announcement-download

## What it does

Reads announcements from the Internet and downloads them.

## How to use it

1. If you haven't done so, install [Node](https://nodejs.org/en/download/current).
2. Clone or download this repository into a directory on your local machine.
3. In the `config` folder, create a `config.json` file. You can look in `config.sample.json` for help. Filesystem paths can be relative or absolute, but absolute paths are recommended.
4. The sample file contains the values to work for F-Class Adventurer's announcements. To use this with another EK Games game (like 999th Hero), find and enter the correct values.
5. Change the value of "outDir" if you want to store the files somewhere else.
6. Open a terminal to the directory where you saved `downloadAnnouncements.mjs`.
7. Run `node downloadAnnouncements.mjs`.

After running, you should see a directory for each announcement that was downloaded. **formattedAnnouncement.txt** contains the announcement text, formatted for Discord. It may need to be split into more than one message. The **imgs** directory contains all the downloaded images from the announcement.

There are still some minor formatting bugs, so look over your Discord post and fix them manually.