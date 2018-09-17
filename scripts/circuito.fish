function jestw
    jest -t $argv[1] --runTestsByPath $argv[2] --watch
end

function jestr 
    jest --runTestsByPath $argv
end

function jesttr 
    jest -t $argv[1] --runTestsByPath $argv[2]
end


