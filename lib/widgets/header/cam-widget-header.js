/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
var fs = require('fs');

var angular = require('camunda-bpm-sdk-js/vendor/angular'),
  template = fs.readFileSync(__dirname + '/cam-widget-header.html', 'utf8');

var apps = {
  welcome: {
    label: 'Welcome'
  },
  admin: {
    label: 'Admin'
  },
  cockpit: {
    label: 'Cockpit'
  },
  tasklist: {
    label: 'Tasklist'
  }
};

module.exports = [
  '$translate',
  function($translate) {
    return {
      transclude: true,

      template: template,

      scope: {
        authentication: '=',
        userName: '=?',
        currentApp: '@',
        signOut: '@?',
        toggleNavigation: '@?',
        myProfile: '@?',
        smallScreenWarning: '@?',
        brandName: '@'
      },

      compile: function(el, attrs) {
        if (!attrs.toggleNavigation) {
          attrs.toggleNavigation = $translate.instant(
            'CAM_WIDGET_HEADER_TOGGLE_NAVIGATION'
          );
        }
        if (!attrs.myProfile) {
          attrs.myProfile = $translate.instant('CAM_WIDGET_HEADER_MY_PROFILE');
        }
        if (!attrs.signOut) {
          attrs.signOut = $translate.instant('CAM_WIDGET_HEADER_SIGN_OUT');
        }
        if (!attrs.brandName) {
          attrs.brandName = 'Camunda';
        }
        if (!attrs.smallScreenWarning) {
          attrs.smallScreenWarning = $translate.instant(
            'CAM_WIDGET_HEADER_SMALL_SCREEN_WARNING'
          );
        }
      },

      controller: [
        '$scope',
        'AuthenticationService',
        function($scope, AuthenticationService) {
          $scope.logout = AuthenticationService.logout;
          $scope.getTargetRoute = function() {
            return $scope.authentication ? '' : '#/login';
          };

          function setApps() {
            var kept = angular.copy(apps);

            if ($scope.currentApp) {
              if ($scope.currentApp === 'welcome' && $scope.authentication) {
                kept = {};
              } else {
                delete kept[$scope.currentApp];
              }
            }

            if ($scope.authentication && $scope.authentication.name) {
              delete kept.welcome;

              Object.keys(kept).forEach(function(appName) {
                if ($scope.authentication.authorizedApps.indexOf(appName) < 0) {
                  delete kept[appName];
                }
              });
            }

            $scope.showAppDropDown = Object.keys(kept).length > 0;

            $scope.apps = kept;
          }

          $scope.$watch('currentApp', setApps);
          $scope.$watch('authentication', setApps);
        }
      ]
    };
  }
];
