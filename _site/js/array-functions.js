function shuffleAndSlice (array, startNumber, endNumber) {
    //Create a copy of the array to avoid modifying the original
    let shuffledArray = array.slice();

    //Fisher-Yates shuffle algorithm
    for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}
    
    //Slice the array
    let slicedArray = shuffledArray.slice(startNumber, endNumber);
    return slicedArray;
}