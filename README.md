# opunguriru

## Installation

    npm install
    npm install nodemon -g
    
## Start Dev Environment

    nodemon -w index.js
    
Go to

    http://localhost:5000/

## Development

Two different websites will be served based on your user-agent:

 - Mobile
 - Desktop

To switch between the version use Chrome's DevTool and the Mobile Device emulation

Live Reload is automatically available on the localhost development environment.

As CSS Framework, [Skeleton](http://getskeleton.com) is already added.

### Desktop

All desktop related files are inside the **desktop** folder. The **style.sass.css** can contain SCSS code which is automatically converted to CSS by the server.


### Mobile

All mobile app files are inside the **mobile** folder. The **index.html** is contains all code required to lunch the **riot.js** view engine inside.

#### HTML
The app screen are inside:

    mobile/tags/app.tag/app.html 

It's such a small app, not additional files required. Reuseable page elements will be exported into tags in case

#### CSS
The main CSS file is:

    mobile/app.sass.css

Add additional files if required. SCSS will be supported for all *.sass.css files.