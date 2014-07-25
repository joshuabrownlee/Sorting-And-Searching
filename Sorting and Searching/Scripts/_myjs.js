var myApp = angular.module("myApp", ['ngRoute']);
myApp.config(function ($routeProvider) {
    $routeProvider
        .when("/",
        {
            templateUrl: "Views/Home.html",
            controller: "HomeController"
        }
        )
        .when("/Home",
        {
            templateUrl: "Views/Home.html",
            controller: "HomeController"
        }
        )
        .when("/Add",
        {
            templateUrl: "Views/Add.html",
            controller: "AddController"
        }
        )
        .when("/Band/:Band",
        {
            templateUrl: "Views/Details.html",
            controller: "DetailController"
        }
        )
    .when("/:search",
    {
        templateUrl: "Views/Home.html",
        controller: "HomeController"
    }
    ).otherwise(
    {
        redirectTo: function () {
            return "/";
        }
    }
    )
});
myApp.factory("Bands", function () {
    return [];
});
myApp.filter("Snippet", function () {
    return function (text) {
        return text.slice(0, 15) + "...";
    }
});

myApp.controller("HomeController", function ($scope, $routeParams, Bands, $http, $location) {
    $scope.Bands = Bands;
    $http.get("https://domo.firebaseio.com/Bands.json")
        .success(
        function (data) {
            for (var x in data) {
                data[x].id = x;
                var output = [];
                for (var i = 0; i < Bands.length; i++) {
                    output.push(Bands[i].id);
                }
                var f = output.indexOf(x);
                if (f === -1) {
                    Bands.push(data[x]);
                }

                //if (Bands.map(function (c) { return c.id }).indexOf(x) === -1) {
                //    //console.log(Bands.indexOf(data[x]));
                //    Bands.push(data[x]);
                //}
                //else {
                //    console.log(JSON.stringify(data[x]));
                //}
            }
        });
    if ($routeParams.search) {
        $scope.message = "You have searched for " + $routeParams.search;
        $scope.query = $routeParams.search;
    }
    else {
        $scope.message = "Welcome to the Band Home Page!";
    }
    $scope.showDetails = function (Band) {
        $location.path("/Band/" + Bands.indexOf(Band));
    };
    //$scope.Snippet = function (text) {
    //    return text.splice(0, 15);
    //}
    $scope.search = function (item) {
        if (!$scope.query) {
            return true;
        }
        if (item.name.toLowerCase().indexOf($scope.query.toLowerCase()) !== -1 ||
            item.description.toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }
});

myApp.controller("AddController", function ($scope, Bands, $http, $location) {

    $scope.addBand = function (name, year, description, picture) {

        var Band = { name: name, year: year, description: description, picture: picture };

        $scope.loading = true;

        $http.post("https://vejabi.firebaseio.com/bands.json", Band)
            .success(function (data) {
                Band.id = data.name;
                Bands.push(Band);
                $location.path("/");
            })
    }
});
myApp.controller("DetailController", function ($scope, $routeParams, Bands, $location, $http) {
    //AJAX Here
    if (Bands[$routeParams.Band]) {
        $scope.Band = Bands[$routeParams.Band];
        $scope.Edit = {
            name: $scope.Band.name,
            picture: $scope.Band.picture,
            description: $scope.Band.description,
            year: $scope.Band.year
        };
    }
    else {
        $location.path("/");
    }
    $scope.Delete = function () {
        $http.delete("https://vejabi.firebaseio.com/" + $scope.Band.id + ".json")
            .success(function () {
                Bands.splice($routeParams.Band, 1);
                $location.path("/");
            });
    };
    $scope.Update = function () {
        $scope.editing = false;
        $http({
            method: "PATCH",
            url: "https://vejabi.firebaseio.com/" + $scope.Band.id + ".json",
            data: $scope.Edit
        })
            .success(function () {
                Bands[$routeParams.Band].name = $scope.Edit.name;
                Bands[$routeParams.Band].year = $scope.Edit.year;
                Bands[$routeParams.Band].picture = $scope.Edit.picture;
                Bands[$routeParams.Band].description = $scope.Edit.description;

            })
    }

});
myApp.controller("SearchController", function ($scope, $routeParams, $location) {
    $scope.search = function (query) {
        $scope.query = "";
        $location.path("/" + query);

    };
});
