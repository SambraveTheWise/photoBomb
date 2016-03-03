angular.module('photoBombApp').controller('mainController', ['$scope', '$route', 
    function ($scope, $route) {
        
        var photoWidth = 600;
        var photoHeight = 800;
        
        /*
            Ensures that the actual size of the canvas (not necessarily
            the displayed size of the canvas) is the same dimensions as
            the photo that will be taken
        */
        var theCanvas = document.getElementById("theCanvas");
        theCanvas.width = photoWidth;
        theCanvas.height = photoHeight;
        var canvasContext = theCanvas.getContext("2d");
        
        /*
            On success of taking the picture
        */
        $scope.photoSuccessCallback = function (imgData) {
            
            imgData = "data:image/jpeg;base64," + imgData;
            
            var theImage = new Image();
            theImage.src = imgData;
            
            theImage.onload = function() {
                
                // draw the image to the canvas
                canvasContext.drawImage(theImage, 0, 0, photoWidth, photoHeight);
                
                // get the image data to be used in background removal
                var pixelData = canvasContext.getImageData(0, 0, photoWidth, photoHeight);

                var numPixelParts = pixelData.data.length;
                for (i = 0; i < numPixelParts; i += 4) {
                    for (j = 0; j < 4; j++) {
                        
                        // 2 is the blue part of the pixel
                        if (j == 2) {
                            pixelData.data[i + j] = 220;
                        }
                    }
                }
                
                canvasContext.putImageData(pixelData, 0, 0);
            }
        }
        
        /*
            On failure to take the picture
        */
        $scope.photoFailCallback = function () {
            alert("Camera failure!");
        }
        
        /*
            Take a picture with the device's camera
        */
        $scope.takePicture = function() {
            // Take picture using device camera and retrieve image as base64-encoded string
            navigator.camera.getPicture($scope.photoSuccessCallback, $scope.photoFailCallback, 
                { 
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    targetWidth: photoWidth,
                    targetHeight: photoHeight,
                    correctOrientation: true
                }
            );   
        }
    
    }]);