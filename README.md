# WSPR Server

This repository contains a software frontend for the WSPRPi hardware by M0WUT.

## Environment Variables

The software takes no command-line arguments, but responds to environment variables as follows:
* Setting `WSPR_EMULATOR` to be non-blank results in the software talking to an emulated hardware device without touching real hardware. This is useful for developing and sanity checks.
* Setting `WSPR_DEBUG` non-blank produces more verbose logging output.

## Prerequisites
The software is built and runs with Python 3.5.
Other Python versions may or may not work as intended.
If the software is not run in emulation mode, it is expected that the hardware is configured. Unexpected results may occur otherwise.

## End-user setup.

Ensure `~/.local/bin/` is on your `$PATH`, and you have the Python 3 version of `pip`, `pip3`.
Then simply `pip3 install wspr-server`.

## Developer Setup
Once you have cloned this repository locally, first build the frontend, then the backend parts of the application.

### Frontend
* Ensure you have a recent version of `npm`.
* Run `npm install`.
* Run `npm run build` - this will run for a while and then produce a bundled file in `static/`. If you are working on the frontend, you may automatically rebuild the files on change with `npm run watch`.

### Backend
This is a standard `setuptools` project. See the [developer guide](http://setuptools.readthedocs.io/en/latest/setuptools.html).
Standard Python best-practices like the use of a virtual environment hold.

Happy Hacking! M0IKY.
