function findIndex (arr,f){
    for(var i = 0; i < arr.length; i++){
        if(f(arr[i])===true){
            return i;
        }
    }
    return -1;
}