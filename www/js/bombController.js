angular.module('photoBombApp').controller('bombController', ['$scope', '$route', 'BombService',
    function ($scope, $route, BombService) {
        
        // Initialize photo info from service
        var photoWidth = BombService.photoWidth;
        var photoHeight = BombService.photoHeight;
        var pixelData = BombService.photoData;
        
        // Threshold for if pixels are similar enough to each other
        var pixelThreshold = 100;
        
        
        // Initialize the canvas with the picture that was taken
        var bombCanvas = document.getElementById("bombCanvas");
        bombCanvas.width = photoWidth;
        bombCanvas.height = photoHeight;
        var bCtx = bombCanvas.getContext("2d");        
        
        // only put it to the canvas if the data is actually there
        if (pixelData.data) {
            bCtx.putImageData(pixelData, 0, 0);
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
            
            /*
            testMakeItBlue();
            testDrawLines();
            */
            
            testThreshold();
           
            
            // put finished photo on canvas
            bCtx.putImageData(pixelData, 0, 0);
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
            function getPixel(xPix, yPix) {
                return ((photoWidth * yPix) + xPix) * 4;            
            }

            /*
                Adds to the pixel value, keeping it at 255 or less
            */
            function addToValue(index, addValue) {
                pixelData.data[index] = pixelData.data[index] + addValue;

                if (pixelData.data[index] > 255) {
                    pixelData.data[index] = 255;
                }
            }

            /*
                Subtracts from the pixel value, keeping it at 0 or higher
            */
            function subtractFromValue(index, subtractValue) {
                pixelData.data[index] = pixelData.data[index] - subtractValue;

                if (pixelData.data[index] < 0) {
                    pixelData.data[index] = 0;
                }
            }
        
        
            /*
                Returns true if the two pixels are similar to each other, given the threshold
            */
            function comparePixels(index1, index2) {
                var pixelDifference = Math.abs(pixelData.data[index1] - pixelData.data[index2]) +
                    Math.abs(pixelData.data[index1 + 1] - pixelData.data[index2 + 1]) +
                    Math.abs(pixelData.data[index1 + 2] - pixelData.data[index2 + 2]);
                    
                return pixelDifference <= pixelThreshold;
            }
        
        //
        //
        //////////////////////////////////////////////////////////////////////////////////
        
        /////////// TESTING FUNCTIONS ////////////
        
        /*
            TEST THRESHOLD
        */
        function testThreshold() {
            
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
                pixelData.data[getPixel(i, 20)] = 255;
                pixelData.data[getPixel(i, 20) + 1] = 0;
                pixelData.data[getPixel(i, 20) + 2] = 0;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixel(20, i)] = 255;
                pixelData.data[getPixel(20, i) + 1] = 0;
                pixelData.data[getPixel(20, i) + 2] = 0;
            }            
            
            for (i = 0; i < photoWidth; i++) {
                pixelData.data[getPixel(i, 40)] = 0;
                pixelData.data[getPixel(i, 40) + 1] = 255;
                pixelData.data[getPixel(i, 40) + 2] = 0;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixel(40, i)] = 0;
                pixelData.data[getPixel(40, i) + 1] = 255;
                pixelData.data[getPixel(40, i) + 2] = 0;
            }               
            
            for (i = 0; i < photoWidth; i++) {
                pixelData.data[getPixel(i, 60)] = 0;
                pixelData.data[getPixel(i, 60) + 1] = 0;
                pixelData.data[getPixel(i, 60) + 2] = 255;
            }
            
            for (i = 0; i < photoHeight; i++) {
                pixelData.data[getPixel(60, i)] = 0;
                pixelData.data[getPixel(60, i) + 1] = 0;
                pixelData.data[getPixel(60, i) + 2] = 255;
            }     
        }
}]);