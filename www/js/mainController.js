angular.module('photoBombApp').controller('mainController', ['$scope', '$route', 'BombService',
    function ($scope, $route, BombService) {
                                          
        var photoWidth = BombService.photoWidth;
        var photoHeight = BombService.photoHeight;  
        
        /*
            Ensures that the actual size of the canvas (not necessarily
            the displayed size of the canvas) is the same dimensions as
            the photo that will be taken
        */
        var theCanvas = document.getElementById("theCanvas");
        theCanvas.width = photoWidth;
        theCanvas.height = photoHeight;
        var canvasContext = theCanvas.getContext("2d");
        
        
        // Initialize the canvas with the picture that was taken previously      
        // only put it to the canvas if the data is actually there
        if (BombService.photoData.data) {
            canvasContext.putImageData(BombService.photoData, 0, 0);
        }
        
        
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

                // give the service the pixel data
                BombService.photoData = pixelData;
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
        
        /*
            Erases the canvas and removes the image data
        */
        $scope.eraseCanvas = function() {
            canvasContext.clearRect(0, 0, photoWidth, photoHeight);
            BombService.photoData = {};
        }
        
        /*
            Navigate to the bomb page
        */
        $scope.toDaBomb = function() {
            window.location.href = "#/bomb";
        }
    }]);