angular.module('service.chat', ['service.socket'])
    .factory('chat', ['$state', '$rootScope', 'socket', '$stateParams', '$timeout', function ($state,$rootScope,socket,$stateParams,$timeout) {

        if(!$rootScope.messages_history){
            $rootScope.messages_history = [];
        }

        function soundClick() {
            var audio = new Audio();
            audio.src = '/sound/drop.wav';
            audio.autoplay = true;
        }

        function soundLikeChat() {
            var audio = new Audio();
            audio.src = '/sound/Squeaky-toy-noise.mp3';
            audio.autoplay = true;
        }

        socket.on('message', function(data){
            $rootScope.message_button = true;
            var data = data[0];
            var id_user_chat = parseInt($stateParams.id_user_chat);
            var id_user = parseInt($rootScope.id_user);
            $rootScope.ids = [id_user_chat, id_user];
            $rootScope.ids = $rootScope.ids.sort();
            $rootScope.id_user = parseInt($rootScope.id_user);
            if(data.reviewed == false && ($stateParams.id_user_chat == data.sender || $stateParams.id_user_chat == data.receiver)){
                $rootScope.messages_history.unshift({_id: data._id, likes:data.likes, sender: data.sender, text: data.text, date: data.date, username: data.username, lastname: data.lastname, other_user: data.id, avatar: data.avatar, color: data.color});

                if($rootScope.id_user == data.sender){
                    $rootScope.text_message = null;
                }else{
                    socket.emit('reviewed', {ids: $rootScope.ids, id_user: $rootScope.id_user});
                }
            }
            if(($state.current.name != 'chat' || !$rootScope.focus || ($stateParams.id_user_chat != data.sender && $rootScope.id_user != data.sender || $stateParams.id_user_chat != data.receiver && $rootScope.id_user != data.receiver)) && $rootScope.id_user != data.sender){
                soundClick();
                $rootScope.new_messages.unshift(data);
            }

            $rootScope.pause = false;
            $rootScope.writing = false;
        });

        socket.on('old messages', function(data){
            $rootScope.ids = [$stateParams.id_user_chat, $rootScope.id_user];
            $rootScope.ids = $rootScope.ids.sort();
            $rootScope.messages_history = $rootScope.messages_history.concat(data.messages);
            $rootScope.loader_message = false;
        });

        socket.on('end old messages', function(data){
            $rootScope.loader_message = false;
        });

        $rootScope.pause = false;

        socket.on('writing', function(data){
            if(data.ids[0] == $stateParams.id_user_chat && data.ids[1] == $rootScope.id_user || data.ids[0] == $rootScope.id_user && data.ids[1] == $stateParams.id_user_chat){
                $rootScope.writing = true;
                setTimeout(function(){
                    $rootScope.writing = false;
                    $rootScope.$apply();
                },5000);
            }
        });


        socket.on("like msg", function(data) {
            for(var key in $rootScope.messages_history){
                if($rootScope.messages_history[key]._id == data[0]._id){
                    var id = parseInt($stateParams.id_user_chat);
                    var v_old = $rootScope.messages_history[key].likes.indexOf(id);
                    var v_new = data[0].likes.indexOf(id);
                    if(v_old == -1 && v_new != -1){
                        soundLikeChat();
                    }
                    $rootScope.messages_history[key] = data[0];
                }
            }
        })


        var init = function(){
            socket.on("new message", function(data) {
                //if($state.current.name != 'chat'){}
                $rootScope.new_messages = data;
            });
        }

        return {
            init: init
        }

    }]);