$(function(){
	// utility
	function tempalert(msg, duration) {
        var el = document.createElement("div");
        el.setAttribute("style", "position:absolute;top:10%;left:10%;background-color:white;text-align:center;");
        el.innerHTML = msg;
        setTimeout(function () {
            el.parentNode.removeChild(el);
        }, duration);
        document.body.appendChild(el);
	}
	// utility
	$("#user").html(sessionStorage.username);
	$("#chaincode_").click(function(){
		getright("chaincode");
	}).hover(over,out);
	$("#invoke_").click(function(){
		getright("invoke");
	}).hover(over,out);
	$("#channel_").click(function(){
		getright("channel_");
	}).hover(over,out);
	$("#query_").click(function(){
		getright("query");
	}).hover(over,out);
	// 
	// debug
	// $("#leftresult").on('click','#explorer1',function(){
	// 	$(".nav").children("li").removeClass("active");
	// 	$(this).addClass("active");
	// 	$("#rightbody").empty();
	// 	$explo=$("<h4>explorer1 Under developing</h4>");
	// 	$("#rightbody").append($explo);
	// });
	$("#logout").click(function(){
		sessionStorage.clear();
		window.location.href="/users/login";
	});
	$("#user").click(function(){
		getright("accountinfo");
	});
});
function getright(topic){
	$("#rightbody").empty();
	$.ajax({
			type:"get",
			url:"/right/?menu="+topic,
			dataType:"html",
			beforeSend:function(xhr){
				xhr.setRequestHeader("authorization","Bearer "+ sessionStorage.token);
				xhr.setRequestHeader("content-type","application/json");
			},
			success:function(data){
				$("#rightbody").html(data);
			},
			error:function(data){
				console.log(data);
			}
	});

}
function over(){
	$(this).addClass("cur");
}
function out(){
	$(this).removeClass("cur");
}
