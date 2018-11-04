

``` bash
#this is a cli fast to create .vue file and import in router auto

# install 
npm install -g l-cli

# run
switch terminal work path same with the path of package.json of project.

# check version
l-cli -version

# get help
l-cli -help

#get verison
l-cli -version

# src/components、src/components、src/router/index.js must be exists first

#create test.vue file in src/components/,the final path is src/components/test/test.vue
#and import in router auto like this : import Test from '@/components/test/test'

l-cli -c test

#create test.vue file in src/views/,the final path is src/views/test/test.vue
#and import in router auto like this : import Test from '@/views/test/test'

l-cli -v test

