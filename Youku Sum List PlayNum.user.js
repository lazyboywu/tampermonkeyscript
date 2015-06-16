// ==UserScript==
// @name         Youku Sum List PlayNum
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http://i.youku.com/u/playlists
// @include      /^http://i\.youku\.com/u/playlists\?*/
// @grant        none
// @require      http://lib.sinaapp.com/js/jquery/1.9.1/jquery-1.9.1.min.js
// ==/UserScript==

function log(message) {
    console.log('sum palynum: '+message);
}

// 专辑id
var playlist_id = '25826849';
// 专辑播放数
var playlist_playnum = 0;
// 专辑播放数呈现容器
var $playlist_playnum_render = null;

// 插入按钮
var playlist_sum_tpl = '<button class="sum_playnum_button">统计</button><span class="sum_playnum_render" style="color:blue;display:none">计算中</span>';
$('#playlist .p_title').each(function(i, e) {
    $(e).append(playlist_sum_tpl);
});

// 绑定按钮事件
$('.sum_playnum_button').click(function(){
    var $tr = $(this).parents('tr');
    var $render = $tr.find('.sum_playnum_render');
    
    $render.show();
    
    var id = $tr.attr('_id');
    if(id) {
        log('start sum '+id);
        playlist_id = id;
        playlist_playnum = 0;
        $playlist_playnum_render = $render;
        doAjaxVideoListInfo(makeAjaxVideoListUrl(1));
    } else {
        $render.html('不能获取专辑id')
    }
});

// 测试逻辑
//$('#videolist thead .topic_info').append('<button id="sum_test">测试</button>');
//$('#sum_test').click(function(){
    //log('start');
    //playlist_id = '23821672';
    //doAjaxVideoListInfo(makeAjaxVideoListUrl(1));
    //log('end');
//});

//判断的url
//$.get('http://i.youku.com/u/playlists/getfoldervideos?__rt=1&__ro=&page=2&id=23821672', function(data){console.log($(data).find('#videolist').find('.heat .ico__statplay').parent().contents().get(1))})

function makeAjaxVideoListUrl(page) {
    return 'http://i.youku.com/u/playlists/getfoldervideos?page='+page+'&id='+playlist_id+'&_r='+(new Date().getTime());
}

function doAjaxVideoListInfo(url) {
    log('ajax url ' + url);
    $.get(url, {}, function(data){
        
        var $data = $($.trim(data));
        var $videolist = $data.find('#videolist');        
        if($videolist.length > 0) {
            // 专辑播放数
            playlist_playnum += getVideoListInfoPagePlayNum($videolist);
        }
        
        // 处理分页
        $pager = $data.find('.qPager');
        next_url = null;
        if($pager.length > 0) {
            next_url = getVideoListInfoNextUrl($pager);            
        }
        
        // 如果有下一页
        if(next_url) {
            log('ajax sleep 200');
            setTimeout(function(){doAjaxVideoListInfo(next_url)}, 200);
            return;
        } else {
            // 呈现最后的结果
            log('playlist ' + playlist_id + ' playnum ' + playlist_playnum);
            $playlist_playnum_render.html('播放数为：'+playlist_playnum);
        }
    }, 'html');
}

function getVideoListInfoNextUrl($pager) {
    //jQuery('.qPager').find('.next a').attr('onclick').match(/\d+/)
    var $next_button = $pager.find('.next a');
    if($next_button && $next_button.attr('onclick')) {        
        return makeAjaxVideoListUrl($next_button.attr('onclick').match(/\d+/).join(''));
    }
    return null;
}

function getVideoListInfoPagePlayNum($videolist) {
    var sum = 0;
    $videolist.children().each(function(i, e){
        var $e = $(e);
        var matches = $e.find('.v_title').text().match('此视频已删除');
        //log('match title ' + matches);
        if(matches && matches.length > 0) {
             return;
        }
        
        var num =  $(e).find('.heat .ico__statplay').parent().contents().eq(1);
        if(num) {
            num = parseInt(num.text().split(',').join(''));
            sum += num;
        }
    });
    return sum;
}
