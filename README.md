# WSPR Software Support

This repository contains a software frontend for the WSPRPi hardware by M0WUT.

## Environment Variables

The software takes no arguments, but responds to environment variables as follows:
* Setting `WSPR_EMULATOR` to be non-blank results in the software talking to an emulated hardware device without touching real hardware. This is useful for developing and sanity checks.
* Setting `WSPR_DEBUG` non-blank produces more verbose logging output.

## Prerequisites
The software requires Python 3.x. The developer uses 3.6 at the time of writing, but other versions have been known to work.
If the software is not run in emulation mode, it is expected that the hardware is configured. Unexpected results may occur otherwise.

## End-user setup.
If using a pre-built binary, follow these steps.
* Ensure you have installed the following Python packages via `pip`: `tornado >= 4.5`, `pyserial >= 3.4`, `requests >= 2.18`, `beautifulsoup4 >= 4.6`, `lxml >= 4.0`.
* Place the `.egg` file wherever you desire, but it must retain the same filename you were given (a technical limitation of the distribution format).
* Make it executable.
* Run it.

## Developer Setup
Once you have cloned this repository locally, first build the frontend, then the backend parts of the application. If you have been given a precompiled `bundle.js`, place it in `static/` and skip the frontend step.

### Frontend
* Ensure you have a recent version of `npm`.
* Run `npm install`.
* Run `node_modules/webpack/bin/webpack.js` - this will run for a while and then produce a bundled file in `static/`.

### Backend
* Produce a sandboxed python environment with `python3 -m venv env`.
* Activate it with `source env/bin/activate` - this will need repeating if you come back with a new shell. You've now got a local python package installation directory, python runtime, and pip.
* Run `pip install` for the packages specified above. `setup.py` can install these for you, but it occasionally does so by building from source for some reason.
* Finally, run `python setup.py develop`. You should now have a sane environment to begin work. You may run `wspr-server` to begin the server, which should behave identically to running an egg.
* To build an egg for distribution, run `python setup.py bdist_egg`. This will produce a .egg file in `dist`.

Happy Hacking! M0IKY.
