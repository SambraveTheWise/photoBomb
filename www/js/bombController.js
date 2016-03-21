angular.module('photoBombApp').controller('bombController', ['$scope', '$route', 'BombService',
    function ($scope, $route, BombService) {
        
        // Initialize photo info from service
        var photoWidth = BombService.photoWidth;
        var photoHeight = BombService.photoHeight;
        var smallPhotoWidth = BombService.smallPhotoWidth;
        var smallPhotoHeight = BombService.smallPhotoHeight;
        var pixelData = BombService.photoData;
        var smallPixelData = BombService.smallPhotoData;
        
        
        /* TODO - programmatically determine what the thresholds should be? */
        // Threshold for if pixels are similar enough to each other
        $scope.pixelThreshold = 50;
        
        // Threshold for how few pixels can be in a region
        $scope.regionThreshold = 30;
        
        // Initialize the canvas with the picture that was taken
        var bombCanvas = document.getElementById("bombCanvas");
        bombCanvas.width = photoWidth;
        bombCanvas.height = photoHeight;
        var bCtx = bombCanvas.getContext("2d");
        if (pixelData.data) {
            bCtx.putImageData(pixelData, 0, 0);
        }
        
        // Initialize the small canvas
        var smallCanvas = document.getElementById("smallCanvas");
        smallCanvas.width = smallPhotoWidth;
        smallCanvas.height = smallPhotoHeight;
        var sCtx = smallCanvas.getContext("2d");
        if (smallPixelData.data) {
            sCtx.putImageData(smallPixelData, 0, 0);
        }
        
        // Initialize array of transparent pixels
        var mask = sCtx.getImageData(0, 0, smallPhotoWidth, smallPhotoHeight);
        for (var i = 0; i < mask.data.length; i++) {
            mask.data[i] = 0;
        }
        
        /*
            Open and close the settings
        */
        $scope.settingsOpen = false;
        $scope.toggleSettings = function() {
            $scope.settingsOpen = !$scope.settingsOpen;
        }
        
        
        /*
            Navigate to the camera page
        */
        $scope.toDaCamera = function() {
            window.location.href = "#";
        }
        
        
        
        
        ///////////////// BACKGROUND REMOVAL //////////////////
        /*
            Remove the background from the image
        */
        $scope.kaboom = function() {
            console.log("ka-BOOM!!!");
            
            // remove the background
            ultimateSegmentation();
        }
        ///////////////////////////////////
        
        
        //////////////////// FUNCTIONS TO FACILITATE IMAGE PROCESSING ////////////////////
        //
        //
        
            /*
                Gets the pixel's start index based on image x, y coordinates
                (the start index is the red value of the pixel - the next couple 
                values are the green value, the blue value, and opacity)
            */
            function getPixelIndex(xPix, yPix) {
                var pixelIndex = ((smallPhotoWidth * yPix) + xPix) * 4 - 2;
                console.log("getPixelIndex(" + xPix + ", " + yPix + " = " + pixelIndex);
                
                return pixelIndex;
            }
        
            /* Functions for getting pixel x and y from the index */
            function getPixelX(pixelIndex) {
                return pixelIndex % smallPhotoWidth;
            }
            function getPixelY(pixelIndex) {
                return pixelIndex / smallPhotoWidth;
            }
            

            /*
                Adds to the pixel value, keeping it at 255 or less
            */
            function addToValue(index, addValue) {
                smallPixelData.data[index] = smallPixelData.data[index] + addValue;

                if (smallPixelData.data[index] > 255) {
                    smallPixelData.data[index] = 255;
                }
            }

            /*
                Subtracts from the pixel value, keeping it at 0 or higher
            */
            function subtractFromValue(index, subtractValue) {
                smallPixelData.data[index] = smallPixelData.data[index] - subtractValue;

                if (smallPixelData.data[index] < 0) {
                    smallPixelData.data[index] = 0;
                }
            }
        
        
            /*
                Returns true if the two pixels are similar to each other, given the threshold
            */
            function comparePixels(index1, index2) {
                var pixelDifference = 
                    Math.abs(smallPixelData.data[index1] - smallPixelData.data[index2]) +
                    Math.abs(smallPixelData.data[index1 + 1] - smallPixelData.data[index2 + 1]) +
                    Math.abs(smallPixelData.data[index1 + 2] - smallPixelData.data[index2 + 2]);
                    
                return pixelDifference <= $scope.pixelThreshold;
            }
        
        
            /*
                Colors the given pixel the given rgb values
            */
            function colorize(pixelIndex, rValue, gValue, bValue) {
                
                smallPixelData.data[pixelIndex] = rValue;
                smallPixelData.data[pixelIndex + 1] = gValue;
                smallPixelData.data[pixelIndex + 2] = bValue;
            }
        
            /*
                Adds colors the given pixel the given rgb values
            */
            function colorizeAdd(pixelIndex, rValue, gValue, bValue) {
                console.log("Colorizing (adding): " + rValue + ", " + gValue + ", " + bValue);
                
                smallPixelData.data[pixelIndex] += rValue;
                rValue = rValue % 256;
                smallPixelData.data[pixelIndex + 1] += gValue;
                gValue = gValue % 256;
                smallPixelData.data[pixelIndex + 2] += bValue;
                bValue = bValue % 256;
            }
        
            /*
                Gets the top neighbor's index of the given pixel index
                Returns -1 if non-existant (e.g. at edge of image)
            */
            function getTopNeighbor(pixelIndex) {
                var top = pixelIndex - (smallPhotoWidth * 4);
                
                if (top < 0) {
                    top = -1;
                }
                
                return top;
            }
                
            /*
                Gets the bottom neighbor's index of the given pixel index
                Returns -1 if non-existant (e.g. at edge of image)
            */
            function getBottomNeighbor(pixelIndex) {
                var bottom = pixelIndex + (smallPhotoWidth * 4);
                
                if (bottom > smallPixelData.data.length) {
                    bottom = -1;
                }
                
                return bottom;
            }
                
            /*
                Gets the left neighbor's index of the given pixel index
                Returns -1 if non-existant (e.g. at edge of image)
            */
            function getLeftNeighbor(pixelIndex) {
                var left = pixelIndex - 4;
                
                if (pixelIndex % smallPhotoWidth == 0) {
                    return -1;
                }
                    
                return left;
            }
        
            /*
                Gets the right neighbor's index of the given pixel index
                Returns -1 if non-existant (e.g. at edge of image)
            */
            function getRightNeighbor(pixelIndex) {
                var right = pixelIndex + 4;
                
                if (right % smallPhotoWidth == 0) {
                    return -1;
                }
                    
                return right;
            }
        
            /*
                Returns the center region's index
            */
            function getCenterRegion() {
                
                // get center pixel index
                var centerPixelX = smallPhotoWidth / 2;
                var centerPixelY = smallPhotoHeight / 2;
                var centerIndex = getPixelIndex(centerPixelX, centerPixelY);
                
                // look through regions, finding which one contains the center pixel
                for (var i = 0; i < segments.length; i++) {
                    
                    // if pixel is in region, return the region's index
                    for (var j = 0; j < segments[i].length; j++) {
                        
                        if (centerIndex == segments[i][j]) {
                        
                            // return center region's index
                            return i;
                        }
                    }
                }
                
                // return -1 if center pixel is not in any region (SHOULDN'T EVER HAPPEN)
                return -1;
            }
        
            /*
                Adds the given region to the mask
            */
            function addRegionToMask(regionIndex) {
                
                // loop through region pixels, adding full alpha to the mask
                for (var i = 0; i < segments[regionIndex].length; i++) {
                    
                    mask.data[segments[regionIndex][i] + 3] = 255;
                }
            }
        
        //
        //
        //////////////////////////////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        ////////////////////////// ULTIMATE SEGMENTATION ///////////////////////////////
        //
        //
        
        // A list of regions of pixels (e.g. a list of lists of pixels)
        var segments = [];
        
        // A list of pixels that are not in a region yet (prepopulated with all image pixels)
        var pixelsRemaining = [];
        for (i = 0; i < smallPixelData.data.length; i+= 4) {
            pixelsRemaining.push(i);
        }
        
        
        /*
            Find the regions and mark them
        */
        function ultimateSegmentation() {
            
            // loop until all of the pixels are in a region
            while (pixelsRemaining.length > 0) {
                
                // select a pixel from the list of remaining pixels 
                // (i.e. pixels not yet assigned to a region
                var currentPixel = pixelsRemaining[0];
                
                // find the region and put it in the list of regions
                segments.push(discoverRegion(currentPixel));
                
                console.log("Pushed a segment");
            }
            
            // get rid of smaller regions - melt them onto neighboring regions
            meltRegions();
            
            // colorize all of the regions
            colorRegions(false);
            
            // get center region
            var centerRegion = getCenterRegion();
            
            // add center region to mask (alpha)
            addRegionToMask(centerRegion);
            
            /* scale mask to full photo width */
            // draw mask to a small canvas
            sCtx.putImageData(mask, 0, 0);
            
            // get image url
            var maskURL = smallCanvas.toDataURL();
            
            // create big canvas (same size as other big canvas)
            var bigMask = document.createElement("canvas");
            bigMask.width = photoWidth;
            bigMask.height = photoHeight;
            var maskContext = bigMask.getContext("2d");
            
            // draw image mask to a big canvas
            var maskImg = new Image;
            maskImg.src = maskURL;
            maskImg.onload = function() {
                maskContext.drawImage(maskImg, 0, 0, photoWidth, photoHeight);
            

                // get the pixel data from that big canvas
                var bigMaskPixels = maskContext.getImageData(0, 0, photoWidth, photoHeight);

                /* apply mask to big image (set all alphas) */
                // loop through all alphas, setting image alphas to mask alphas
                for (var i = 3; i < pixelData.data.length; i+=4) {

                    pixelData.data[i] = bigMaskPixels.data[i];
                }

                // draw final masked big image
                bCtx.putImageData(pixelData, 0, 0);
            }
        }
        
        
        /*
            Given a pixel, returns that pixel's region (i.e. an array of pixels)
        */
        function discoverRegion(startPixel) {
            
            console.log("Getting a region based off of pixel: " + startPixel);
            
            // the region to push all of the matching pixels into
            var currentRegion = [];
            
            // add the starting pixel to the region
            currentRegion.push(startPixel);
            
            // remove the starting pixel from remainingPixels list
            pixelsRemaining.splice(pixelsRemaining.indexOf(startPixel), 1);
            
            // array of neighboring pixels to test
            var testNeighbors = [];
            
            // if top / bottom / left / right neighbors meet threshold, 
            //        - add to currentRegion
            //        - remove from pixelsRemaining
            //        - add to testNeighbors
            var firstTop = getTopNeighbor(startPixel);
            console.log("firstTop is " + firstTop);
            
            // neighbor has to exist and can't already be in a region
            if (firstTop != -1 && pixelsRemaining.indexOf(firstTop) != -1) {
                if (comparePixels(startPixel, firstTop)) {

                    // add to currentRegion
                    currentRegion.push(firstTop);

                    // remove from pixelsRemaining
                    pixelsRemaining.splice(pixelsRemaining.indexOf(firstTop), 1);

                    // add to testNeighbors
                    testNeighbors.push(firstTop);
                }
            }
            
            var firstBottom = getBottomNeighbor(startPixel);
            console.log("firstBottom is " + firstBottom);
            
            // neighbor has to exist and can't already be in a region
            if (firstBottom != -1 && pixelsRemaining.indexOf(firstBottom) != -1) {
                if (comparePixels(startPixel, firstBottom)) {

                    // add to currentRegion
                    currentRegion.push(firstBottom);

                    // remove from pixelsRemaining
                    pixelsRemaining.splice(pixelsRemaining.indexOf(firstBottom), 1);

                    // add to testNeighbors
                    testNeighbors.push(firstBottom);
                }
            }
            
            var firstLeft = getLeftNeighbor(startPixel);
            console.log("firstLeft is " + firstLeft);
            
            // neighbor has to exist and can't already be in a region
            if (firstBottom != -1 && pixelsRemaining.indexOf(firstLeft) != -1) {
                if (comparePixels(startPixel, firstLeft)) {

                    // add to currentRegion
                    currentRegion.push(firstLeft);

                    // remove from pixelsRemaining
                    pixelsRemaining.splice(pixelsRemaining.indexOf(firstLeft), 1);

                    // add to testNeighbors
                    testNeighbors.push(firstLeft);
                }
            }
            
            var firstRight = getRightNeighbor(startPixel);
            console.log("firstRight is " + firstRight);
            
            // neighbor has to exist and can't already be in a region
            if (firstRight != -1 && pixelsRemaining.indexOf(firstRight) != -1) {
                if (comparePixels(startPixel, firstRight)) {

                    // add to currentRegion
                    currentRegion.push(firstRight);

                    // remove from pixelsRemaining
                    pixelsRemaining.splice(pixelsRemaining.indexOf(firstRight), 1);

                    // add to testNeighbors
                    testNeighbors.push(firstRight);
                }                    
            }
            
            
            // loop until there are no more matching neighbor pixels
            while (testNeighbors.length > 0) {
                
                // select first pixel to test neighbors of
                var currentPixel = testNeighbors[0];
                
                // remove currentPixel from testNeighbors so that it's only tested once
                testNeighbors.splice(testNeighbors.indexOf(currentPixel), 1);
                
                
                // if top / bottom / left / right neighbors meet threshold, 
                //        - add to currentRegion
                //        - remove from pixelsRemaining
                //        - add to testNeighbors
                var topNeighbor = getTopNeighbor(currentPixel);
                
                // neighbor has to exist and can't already be in a region
                if (topNeighbor != -1 && pixelsRemaining.indexOf(topNeighbor) != -1) {
                    if (comparePixels(currentPixel, topNeighbor)) {

                        // add to currentRegion
                        currentRegion.push(topNeighbor);

                        // remove from pixelsRemaining
                        pixelsRemaining.splice(pixelsRemaining.indexOf(topNeighbor), 1);

                        // add to testNeighbors
                        testNeighbors.push(topNeighbor);
                    }
                }

                var bottomNeighbor = getBottomNeighbor(currentPixel);
                
                // neighbor has to exist and can't already be in a region
                if (bottomNeighbor != -1 && pixelsRemaining.indexOf(bottomNeighbor) != -1) {
                    if (comparePixels(currentPixel, bottomNeighbor)) {

                        // add to currentRegion
                        currentRegion.push(bottomNeighbor);

                        // remove from pixelsRemaining
                        pixelsRemaining.splice(pixelsRemaining.indexOf(bottomNeighbor), 1);

                        // add to testNeighbors
                        testNeighbors.push(bottomNeighbor);
                    }     
                }

                var leftNeighbor = getLeftNeighbor(currentPixel);
                
                // neighbor has to exist and can't already be in a region
                if (leftNeighbor != -1 && pixelsRemaining.indexOf(leftNeighbor) != -1) {
                    if (comparePixels(currentPixel, leftNeighbor)) {

                        // add to currentRegion
                        currentRegion.push(leftNeighbor);

                        // remove from pixelsRemaining
                        pixelsRemaining.splice(pixelsRemaining.indexOf(leftNeighbor), 1);

                        // add to testNeighbors
                        testNeighbors.push(leftNeighbor);
                    }
                }

                var rightNeighbor = getRightNeighbor(currentPixel);
                
                // neighbor has to exist and can't already be in a region
                if (rightNeighbor != -1 && pixelsRemaining.indexOf(rightNeighbor) != -1) {
                    if (comparePixels(currentPixel, rightNeighbor)) {

                        // add to currentRegion
                        currentRegion.push(rightNeighbor);

                        // remove from pixelsRemaining
                        pixelsRemaining.splice(pixelsRemaining.indexOf(rightNeighbor), 1);

                        // add to testNeighbors
                        testNeighbors.push(rightNeighbor);
                    }       
                }
            }
            
            // return the complete region
            return currentRegion;
        }
        
        
        /*
            Color each region with a different color
        */
        function colorRegions(averageColors) {
            
            // loop through all regions
            for (i = 0; i < segments.length; i++) {
                
                
                if (averageColors) {
                    /*
                        Cycle through all of the pixels to find the average color for the region
                    */
                    var rVal = 0;
                    var gVal = 0;
                    var bVal = 0;
                    var totalSegments = segments[i].length;
                    for (j = 0; j < segments[i].length; j++) {
                        rVal += smallPixelData.data[segments[i][j]];
                        gVal += smallPixelData.data[segments[i][j] + 1];
                        bVal += smallPixelData.data[segments[i][j] + 2];
                    }

                    // divide by occurrences to get average color values
                    rVal = rVal / totalSegments;
                    gVal = gVal / totalSegments;
                    bVal = bVal / totalSegments;
                }
                else {                
                    //generate a random color
                    var rVal = Math.floor(Math.random() * 256);
                    var bVal = Math.floor(Math.random() * 256);
                    var gVal = Math.floor(Math.random() * 256);                
                }
                
                // loop through all pixels in that region, colorizing them
                for (j = 0; j < segments[i].length; j++) {
                    colorize(segments[i][j], rVal, gVal, bVal);
                }
            }
        }
        
        
        /*
            Returns the region that the pixel is in
        */
        function getRegion(pixelIndex) {
            
            // loop through all the regions, looking for the pixel
            for (i = 0; i < segments.length; i++) {
                
                // if the pixel is in the array, return the segment
                if (segments[i].indexOf(pixelIndex) != -1) {
                    
                    return i;
                }
            }
            
            // no pixel was found     
            return -1;
        }
        
        
        /*
            Get rid of the smaller regions - melt the smaller regions onto
            the neighboring regions
        */
        function meltRegions() {
            
            // loop through all regions (except first), melting the small ones onto big ones
            for (var i = 1; i < segments.length; i++) {
                
                // if the region is small (e.g. has less pixels than regionThreshold)
                if (segments[i].length < $scope.regionThreshold && segments[i].length > 0) {
                    
                    console.log("Region " + i + " has " + segments[i].length + " pixels - TOO SMALL!");
                    
                    /* melt the region onto the region to the left of it */
                    
                    // get the region that the pixels will melt onto
                    var connectedRegion = getLeftNeighbor(segments[i][0])
                    if (connectedRegion == -1) {
                        // the top region is the connected region if on the left side of the image
                        connectedRegion = getTopNeighbor(segments[i][0]);
                    }
                    var hungryRegion = getRegion(connectedRegion);

                    console.log("Region " + i + " melting onto region " + hungryRegion);
                    
                    // loop through small region, melting onto hungry region
                    for (j = 0; j < segments[i].length; j++) {
                        
                        // melt onto region
                        segments[hungryRegion].push(segments[i][j]);
                    }
                    
                    // remove all pixels in region that was just melted
                    segments[i].length = 0;
                }
            }
        }
        
        //
        //
        ///////////////////////// END ULTIMATE SEGMENTATION ////////////////////////////
        
        
        
        
        
        
        
        
        
        
        
        /*
            TEST UP DOWN LEFT RIGHT
        */
        function upDownLeftRight() {
            
            
            
            // cycle through all pixels
            for (i = 0; i < 40000; i += 4) {
                
                colorizeAdd(i, 0, 0, 100);
                
                console.log("(" + pixelData.data[i] + 
                            ", " + pixelData.data[i + 1] +
                            ", " + pixelData.data[i + 2] +
                            ", " + pixelData.data[i + 3] + ")");
                
            }
            
            
            
            /*
            
            var center = getPixelIndex(0, 799);
            var top = getTopNeighbor(center);
            var bottom = getBottomNeighbor(center);
            var left = getLeftNeighbor(center);
            var right = getRightNeighbor(center);
            
            colorize(center, 255, 0, 0);
            colorize(top, 0, 0, 255);
            colorize(bottom, 0, 0, 255);
            colorize(left, 0, 0, 255);
            colorize(right, 0, 0, 255);
            */
        }
        
        
        /*
            TEST FIRST PIXEL THRESHOLD
        */
        function testFirstPixelThreshold() {
            
            var meetsThreshold = [];
            
            for (i = 0; i < pixelData.data.length; i += 4) {
                if (comparePixels(0, i)) {
                    //add to array of pixels to change blue
                    meetsThreshold.push(i);
                }
            }
                        
            // turn pixels blue (if meet threshold)
            for (i = 0; i < meetsThreshold.length; i++) {
                pixelData.data[meetsThreshold[i]] = 0;
                pixelData.data[meetsThreshold[i] + 1] = 0;
                pixelData.data[meetsThreshold[i] + 2] = 255;
            }
        }
        
        /*
            TEST MAKE IT BLUE
        */
        function testMakeItBlue() {
            for (i = 0; i < pixelData.data.length; i += 4) {
                pixelData.data[i + 2] = 255;
            }
        }
        
        /*
            TEST DRAWING PIXEL LINES
        */
        function testDrawLines() {
            
            for (i = 0; i < photoWidth; i++) {
                pixelData.data[getPixelIndex(i, 20)] = 255;
                pixelData.data[getPixelIndex(i, 20) + 1] = 0;
                pixelData.data[getPixelIndex(i, 20) + 2] = 0;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixelIndex(20, i)] = 255;
                pixelData.data[getPixelIndex(20, i) + 1] = 0;
                pixelData.data[getPixelIndex(20, i) + 2] = 0;
            }            
            
            for (i = 0; i < photoWidth; i++) {
                pixelData.data[getPixelIndex(i, 40)] = 0;
                pixelData.data[getPixelIndex(i, 40) + 1] = 255;
                pixelData.data[getPixelIndex(i, 40) + 2] = 0;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixelIndex(40, i)] = 0;
                pixelData.data[getPixelIndex(40, i) + 1] = 255;
                pixelData.data[getPixelIndex(40, i) + 2] = 0;
            }               
            
            for (i = 0; i < photoWidth; i++) {
                pixelData.data[getPixelIndex(i, 60)] = 0;
                pixelData.data[getPixelIndex(i, 60) + 1] = 0;
                pixelData.data[getPixelIndex(i, 60) + 2] = 255;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixelIndex(60, i)] = 0;
                pixelData.data[getPixelIndex(60, i) + 1] = 0;
                pixelData.data[getPixelIndex(60, i) + 2] = 255;
            }     
        }
}]);