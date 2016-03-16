angular.module('photoBombApp').controller('mainController', ['$scope', '$route', 'BombService',
    function ($scope, $route, BombService) {
                                          
        var photoWidth = BombService.photoWidth;
        var photoHeight = BombService.photoHeight;
        var smallPhotoWidth = BombService.smallPhotoWidth;
        var smallPhotoHeight = BombService.smallPhotoHeight;
        
        /*
            Ensures that the actual size of the canvas (not necessarily
            the displayed size of the canvas) is the same dimensions as
            the photo that will be taken
        */
        var theCanvas = document.getElementById("theCanvas");
        theCanvas.width = photoWidth;
        theCanvas.height = photoHeight;
        var canvasContext = theCanvas.getContext("2d");
        
        
        // Generate the canvas for the small image
        var smallCanvas = document.createElement('canvas');
        smallCanvas.width = smallPhotoWidth;
        smallCanvas.height = smallPhotoHeight;
        var smallContext = smallCanvas.getContext("2d");        
        
        
        /*
            If not on a mobile device, put a default image on
        */
        if (!window.cordova) {
            console.log("Running in the browser - default image in canvas");
            
            var defaultImage = document.getElementById("defaultImage");
            
            defaultImage.onload = function() {
                // put on normal canvas
                canvasContext.drawImage(defaultImage, 0, 0, photoWidth, photoHeight);
                BombService.photoData = canvasContext.getImageData(0, 0, photoWidth, photoHeight);
                
                // put on small canvas
                smallContext.drawImage(defaultImage, 0, 0, smallPhotoWidth, smallPhotoHeight);
                BombService.smallPhotoData = smallContext.getImageData(0, 0, smallPhotoWidth, smallPhotoHeight);
            }
        }
        
        
        // Initialize the canvas with the picture that was taken previously      
        // only put it to the canvas if the data is actually there
        if (BombService.photoData.data) {
            canvasContext.putImageData(BombService.photoData, 0, 0);
        }
        
        
        /*
            On success of taking the picture
        */
        $scope.photoSuccessCallback = function (imgData) {
            
            // Start loading the image
            imgData = "data:image/jpeg;base64," + imgData;
            var theImage = new Image();
            theImage.src = imgData;
            
            
            theImage.onload = function() {
                
                //////////  NORMAL CANVAS  //////////
                
                // draw the image to the normal canvas
                canvasContext.drawImage(theImage, 0, 0, photoWidth, photoHeight);
                
                // send full-size image data to the service
                BombService.photoData = canvasContext.getImageData(0, 0, photoWidth, photoHeight);
                
                
                ///////////  SMALL CANVAS  //////////
                
                // draw image to small canvas
                smallContext.drawImage(theImage, 0, 0, smallPhotoWidth, smallPhotoHeight);
                
                // send small image data to the service
                BombService.smallPhotoData = smallContext.getImageData(0, 0, smallPhotoWidth, smallPhotoHeight);
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