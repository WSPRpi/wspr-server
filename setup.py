from setuptools import setup, find_packages

setup(
	name="WSPR-server",
	version="0.1",
	packages=find_packages(),
	install_requires=[
		'tornado >= 4.5',
		'pyserial >= 3.4'
	],
	entry_points={
		'console_scripts': ['wspr-server = wspr.server:run']
	}
)
