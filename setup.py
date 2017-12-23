from setuptools import setup, find_packages

setup(
	name="WSPR-server",
	version="0.1",
	packages=find_packages(),
	install_requires=[
		'tornado >= 4.5',
		'pyserial >= 3.4',
		'requests >= 2.18',
		'beautifulsoup4 >= 4.6',
		'lxml >= 4.0'
	],
	entry_points={
		'console_scripts': ['wspr-server = wspr.server:run'],
		'setuptools.installation': ['eggsecutable = wspr.server:run']
	},
	include_package_data=True,
	package_data={
		'static': ['index.html', 'bundle.js']
	}
)
