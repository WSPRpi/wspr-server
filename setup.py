from setuptools import setup, find_packages

setup(
	name="wspr-server",
	version="0.1.13",
	url="https://github.com/wsprpi/wspr-software",
	author="Michael Rawson",
	author_email="michael@rawsons.uk",
	packages=find_packages(),
	install_requires=[
		'tornado >= 4.5',
		'pyserial >= 3.4',
		'RPi.GPIO >= 0.6'
	],
	entry_points={
		'console_scripts': ['wspr-server = wspr.server:run']
	},
	include_package_data=True,
	package_data={
		'static': ['index.html', 'bundle.js']
	}
)
