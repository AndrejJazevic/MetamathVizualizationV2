# MetamathVizualizationV2
MetamathVizualizationV2 tool is used for verifying and visualizing Metamath langauage proofs using figures and tables.

There are two different main page files: index.html and index-set.html. Choose only one to run the application. On some operating systems it is not recommended to use Firefox web browser for loading big files.

There are multiple ways of running this tool:
- Double clicking on a index.html file. This method only works with index.html and might not work in some web browser. For index-set.mm run a server. 
- Running a server with Node.js using `node server.js` command. Before running this command make sure `npm install` command executed as well. The content will be available with http://localhost:8000 address.
- Running a different server other than Node.js, for example, Python server using `python -m http.server` command.

Overall, it is recommended to run application while running a server.
