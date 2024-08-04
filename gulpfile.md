# Gulp Tasks Documentation

## Task: `server:up`

Starts a local server for serving static assets with live reload enabled. This server serves files from the guide destination and the project's compiled files.

#### Key Points:

- Serves files from the `config.guideDest` and `config.projectStaticFiles` directories.
- Runs on port 5000 and enables live reload on port 9000.
- Adds CORS headers to responses.

## Task: `server:reload:guide`

Reloads the page after the `markguide:compile` task is completed.

#### Key Points:

- Reloads the HTML files located in the `config.guideDest` directory.

## Task: `compile:styles:assets`

Compiles Sass files for assets into the specified destination folder.

#### Key Points:

- Compiles Sass files from `config.sassSrc`.
- Outputs the compiled CSS to `config.sassDest`.

## Task: `compile:styles:assets:markguide`

Compiles Sass files for assets into the markguide destination folder.

#### Key Points:

- Compiles Sass files from config.sassSrc.
- Outputs the compiled CSS to the assets/css directory within the config.guideDest folder.

## Task: `scss:watch`

Watches for changes in Sass files and triggers recompilation and live reload.

#### Key Points:

- Watches for changes in all `.scss` files within the `config.sassSrc` directory.
- On change, runs the `compile:styles:assets:markguide` task.


## Task: markguide:compile
Description: Compiles all components pages for the markguide.

#### Key Points:

- Uses the `markguide.build()`` method to compile the pages.

## Task: `markguide:compile:incremental`

Compiles a specific page for the markguide based on the changed file path.


#### Key Points:

- Uses the `markguide.build(changedFilePath)` method to compile the changed page.

## Task: `markguide:compile:all`

Compiles all pages for the markguide.

#### Key Points:

- Uses the markguide.buildAll() method to compile all pages.

## Task: `markguide:watch`

Watches for changes in Sass and Markdown files and triggers incremental compilation and live reload.

#### Key Points:

- Watches for changes in all .scss and .md files within the config.guideSrc directory.
- On change, runs the markguide:compile:incremental and server:reload:guide tasks.

## Task: `dev`

Runs the development tasks including starting the server, compiling styles for markguide, and watching for changes.

#### Key Points:

- Runs the `server:up`, `compile:styles:assets:markguide`, and `scss:watch` tasks in parallel.

## Task: dev:markguide

Runs the development tasks specific to the markguide including starting the server, compiling all pages, and watching for changes.

#### Key Points:

- Runs the `server:up`, `markguide:compile:all`, and `markguide:watch` tasks in parallel.

## Task: `build`

Builds the project by compiling styles and markguide pages.

#### Key Points:

- Runs the `compile:styles:assets`, `compile:styles:assets:markguide`, and `markguide:compile:all` tasks in parallel.
- Each task is configured to handle specific parts of the build process, making it easier to develop, watch, and compile assets and documentation.
