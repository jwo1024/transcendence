# #!/bin/sh

# # Check if the ./node_modules directory is empty
# if [ ! -d "./node_modules" || -z "$(ls -A ./node_modules)" ]; then
#   echo "node_modules directory is empty. Running npm install..."
#   npm install
# else
#   echo "node_modules directory is not empty. Skipping npm install."
# fi
#!/bin/sh

# Check if ./node_modules directory exists
if [ ! -d "./node_modules" ]; then
  echo "./node_modules directory does not exist. Running 'npm install'..."
  npm install
  npm i -g @nestjs/cli
else
  # Check if ./node_modules directory is empty
  if [ ! "$(ls -A ./node_modules)" ]; then
    echo "./node_modules directory is empty. Running 'npm install'..."
    npm install
    npm i -g @nestjs/cli
  else
    echo "./node_modules directory is not empty. No need to run 'npm install'."
  fi
fi