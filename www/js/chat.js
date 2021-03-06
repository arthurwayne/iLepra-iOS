(function(){
    var data = null,
        refreshInterval = null,

        // dom
        chatList = null,
        chatLimit = 64;

    var refreshMessages = function(){
        // clean old
        chatList.empty();
        // render posts
        var p = "",
            i, max = data.length > chatLimit ? chatLimit : data.length;
        for(i = 0; i < max; i++)
            p += _.template(chatTemplate, data[i]);
        chatList.append(p);
        // redraw styles
        chatList.listview('refresh');
    };

    var requestNewChatData = function(isInit){
        $(document).bind(iLepra.events.ready, function(event){
            $(document).unbind(event);
            data = iLepra.chat.messages.slice(0);
            data.sort(function(a,b){ return a.id > b.id ? -1 : 1; });
            refreshMessages();
            if( typeof isInit != 'undefined' && isInit ){
                // hide loading msg
                $.mobile.hidePageLoadingMsg();
            }
        });
        iLepra.chat.getMessages();
    };

    // render page on creation
    $(document).on('pagecreate', "#chatPage", function(){
        chatList = $("#chatList");
        chatInput = $("#chatInput");

        $("#submitChat").bind(iLepra.config.defaultTapEvent, function(e){
            e.preventDefault();
            e.stopImmediatePropagation();

            var text = chatInput.val();
            chatInput.val("");

            // clear interval to evade overlap
            window.clearInterval( refreshInterval );

            $.mobile.showPageLoadingMsg();
            $(document).bind(iLepra.events.ready, function(event){
                $(document).unbind(event);
                $.mobile.hidePageLoadingMsg();
                // get data
                data = iLepra.chat.messages.slice(0);
                data.sort(function(a,b){ return a.id > b.id ? -1 : 1; });
                // render
                refreshMessages();
                // put refresh interval back
                refreshInterval = setInterval ( "requestNewChatData()", 10000 );
            });
            iLepra.chat.sendMessage(text);
        });
    });
    $(document).on('pagehide', "#chatPage", function(){
        clearInterval( refreshInterval );

        chatList.empty();
    });
    $(document).on('pagebeforeshow', "#chatPage", function(){
        window.plugins.nativeUI.setTitle({title: "Лепрочятик", organize: false, refresh: false, menu: true});

        // set refresh interval
        refreshInterval = window.setInterval(requestNewChatData, 10000 );
    });
    $(document).on('pageshow', "#chatPage", function(){
        requestNewChatData(true);

        $.mobile.showPageLoadingMsg();
    });

    $(document).on("tap", "li.chatMessage", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        var username = $(this).data('user');

        chatInput.val(username+": ");
    });

    window.cleanchatPage = function(){};
})();