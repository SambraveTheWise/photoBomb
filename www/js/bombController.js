angular.module('photoBombApp').controller('bombController', ['$scope', '$route', 'BombService',
    function ($scope, $route, BombService) {
        
        // Initialize photo info from service
        var photoWidth = BombService.photoWidth;
        var photoHeight = BombService.photoHeight;
        var pixelData = BombService.photoData;
        
        
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
}]);