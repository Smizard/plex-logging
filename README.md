# plex-logging
Logs Plex events using Plex Webhooks. (Also, it includes code for changing lights in smart devices but just comment that out).

## Pull repo.
```shell
git clone https://github.com/Smizard/plex-logging.git
cd plex-logging
```

## Database Setup.
```shell
sudo apt-get install mysql-server
mysql_secure_installation
mysql -u root -p
```
```SQL
SOURCE <LOCATION_OF_SCHEMA.SQL>;    # I usually just drag and drop the file.
FLUSH TABLES;
```
Now your database should be setup with at least a root user and a root password. I usually setup a user specifically for the DB so my password for root aren't stored plain text (we will store it plain text in a minute)

```SQL
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRAND ALL PRIVILEGES ON *.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
quit;
```
```shell
service mysql start
```

Now the database is all set up and running.

## Server/Node Setup.
```shell
sudo apt install npm
npm i
```
With your favorite text editor (Emacs For Life!), create the file `config.json`
Example config file:
```json
{
    "host": "localhost",
    "user": "username",
    "password": "password",
    "database": "plex-logging"
}
```

Now you can use your favorite process monitor to keep the app running in case of unexpected crash. I usually use a combination of npm and pm2. First, to test lets use npm.

Navigate to the root folder again.
```shell
npm start src/app.js
```

You may need to modify some of the code to ensure it is working or tweak some settings (port number or something). npm will restart when it notices a change in the file (why I use npm to test). As soon as you get the messags
```
Listening: 12035
DB Connected
```

you can start testing the hooks from plex. Go to your plex account home page. Account > Webhooks > Add Webhook add `http://localhost:12035/` to your webhooks. Start a movie from that server on one of your plex clients and see if the terminal window logs out the right stuff. Try a command in the db like `select * from Movies;` to see if it was logged. Once I have confirmed that it is working it is better to use pm2. So now kill the npm process `ctrl+c` and start the pm2 monitor. `pm2 start /srcapp.js`

## Same DB Queries.
Gets a list of all the movies watched, who watched them, for how long (total), how many times (times started or resumed), and on what date ordered by date watched (earliest date first)
```SQL
select
Movies.Title 'Movie Title', Users.Title 'User Title', sum(MovieWatches.Duration) / 3600000 'Total Time Watched(Hours)', count(Movies.ID and Users.ID) 'Watch Counts', max(MovieWatches.StartTime) 'Last Watched'
	from MovieWatches, Movies, Users
	where MID = Movies.ID and UID = Users.ID
	group by Movies.ID, Users.ID
	order by 'Last Watched';
```

Same as above but for TV shows.
```SQL
select
TVShows.Title 'Show Title', Episodes.Episode 'Episode', Users.Title 'User Title', sum(TVShowWatches.Duration) / 3600000 'Total Time Watched(Hours)', count(TVShows.ID and Users.ID) 'Watch Counts'
	from TVShowWatches, TVShows, Users, Episodes
	where TVShowWatches.TSID = TVShows.ID and UID = Users.ID and EID = Episodes.Episode
	group by TVShows.ID, Users.ID, Episodes.Episode;
```
