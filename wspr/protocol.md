# Control Protocol

The hardware talks to the server by means of a CAT-control like protocol.
It's an event-driven, asynchronous protocol which exchanges small packets of data via ASCII.

Each command consists of a single _command character_, followed by some arbitrary (non-semicolon-containing) data, followed by a semicolon and a newline (yay redundancy).
Commands may travel either from hardware to software, or from software to hardware.

The commands are as follows. Where it makes sense, the command data may be empty to query for current data.

* I for Ip address. Only ever queried, used to display on the hardware output.
* H for Hostname. Only ever queried, is the name of the machine the software runs on.
* C for Callsign. Callsigns are 10 or fewer characters, and contain exactly 0 or 1 slashes. If there is a slash, there must be 1 to 3 characters before the slash, OR either one alphanumeric or two numeric characters after the slash at the end of the callsign. The main callsign (not the beginning or end before/after a slash) must have a number in second/third character.
* L for Locator. Locators are 6-character maidenhead locators, or the special value 'GPS' to indicate the hardware should use its onboard GPS.
* P for Power. Power is specified in dBm, from 0-60, and is always an integral number between 0 and 60, ending in 0, 3, or 7. Milliwatt conversions are calculated in the frontend for user convenience.
* B for Band-hop. A comma-separated list of single hexadecimal digits. 24 values, one for each hour in the day.
* X for tX percentage. Exactly 3 digits specifying 0-100, multiple of 10.
* S for Status. Arbitrary string containing hardware-reported status. Only sent from Hardware to Software in case of error.
* T for Timestamp. Used to keep software in sync with hardware time. String in Unix `date` format.
* V for Version number. String of format "1.1" or "test1" where 1 represents any arbitary number.
* U to indicate that the Pi is about to upgrade itself, contains no data, the response is "U;\n" to indicate that the PIC has shutdown and is ready to be reset
* F to indicate firmware upgrade is about to happen, contains no data. Response is "F;\n" when the PIC has shutdown and is ready to be reset.
* D for Disable TX. A comma-separated list of single binary digits. 12 values, one for each band. '0' to allow TX, '1' to disable TX
