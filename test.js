// You are given two arrays: arr and priority. The task is to reorder the arr
// such that all elements present in the priority array appear first, maintaining 
// their relative order from the original arr, followed by the remaining elements
// of arr in their increasing order.

let arr = [1, 2, 6, 1, 8, 2, 4, 1, 6, 0, 4, 5, 6, 1];
let priority = [4, 6, 8];



let priorityArray=[];
let normalArray=[];


for(let i = 0; i< arr.length; i++){
      if(!priorityArray.includes(arr[i]) && priority.includes(arr[i])){
        let indexOf = priority.indexOf(arr[i]);
        priorityArray[indexOf] =arr[i];
      }else{
          normalArray.push(arr[i]);
        } 
}

normalArray.sort((a,b) => b-a);
let newArray = [ ...priorityArray ,...normalArray];


console.log(newArray);