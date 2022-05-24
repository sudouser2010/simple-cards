simple-cards
============

an opensource Knockout-PhoneGap flashcard app

## Description

I created this project because at the time of inception, there were no good free flashcard programs on Google Play. Currently, I'm in the process of fixing defects in phase1. An image of phase1's initial design is shown below:
![design_layout1.png](https://github.com/sudouser2010/simple-cards/blob/master/design_layout1.png "design_layout1.png")

Eventually, this will become a cross-platform mobile flashcard application. This will also be available on the web as well because it is an HTML5 application.

## Storage

I'm using local storage to store the flashcard data. I chose local storage because it was the only option if I wanted this application to work both on the web and on PhoneGap friendly mobile devices. For development purposes, the app is populated with inital [data](https://github.com/sudouser2010/simple-cards/blob/main/www/data.js)


## Deploying

To view this application as a website, clone the project, navigate to www and open up index.html. It does not need access to the web because everything is stored locally.
