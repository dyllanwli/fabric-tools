$(function(){
	$("#user").html(sessionStorage.username);
	$("#logapi").click(function(){
		getleft("log");
		getright("orderlog");
	}).hover(over,out);
	$("#protransaction").click(function(){
		getleft("product");
		getright("orderproduct");
	}).hover(over,out);
	$("#channel_").click(function(){
		getleft("leftapi");
		getright("channel_");
	}).hover(over,out);
	$("#phonescams").click(function(){
		getleft("phonescams");
		getright("phonescams");
	}).hover(over,out);
	$("#producttransaction").click(function(){
		getleft("producttransaction");
		getright("producttransaction");
	}).hover(over,out);
	// 
	// 
	$("#leftresult").on('click','#explorer1',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		$("#rightbody").empty();
		$explo=$("<h4>explorer1 Under developing</h4>");
		$("#rightbody").append($explo);
	});
	$("#leftresult").on('click','#explorer2',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		$("#rightbody").empty();
		$explo=$("<h4>explorer2 Under developing</h4>");
		$("#rightbody").append($explo);
	});
	$("#leftresult").on('click','#orderlog',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		getright("orderlog");
	});
	$("#leftresult").on('click','#orderproduct',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		getright("orderproduct");
	});
	
	$("#leftresult").on('click','#accountinfo',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		getright("accountinfo");
	});
	$("#leftresult").on('click','#help',function(){
		$(".nav").children("li").removeClass("active");
		$(this).addClass("active");
		getright("help");
	});
	$("#leftresult").on('click','#phonemark',function(){
		$(".nav").children("li").removeClass("active");
                $(this).addClass("active");
		getright('phonescams');	
	})
	$("#logout").click(function(){
		sessionStorage.clear();
		window.location.href="/users/login";
	});
	$("#user").click(function(){
		getright("accountinfo");
	});
});
function getleft(topic){
	$("#leftresult").empty();
	$.ajax({
			type:"get",
			url:"/left/?menu="+topic,
			dataType:"html",
			beforeSend:function(xhr){
				xhr.setRequestHeader("authorization","Bearer "+sessionStorage.token);
				xhr.setRequestHeader("content-type","application/json");
			},
			success:function(data){
				$("#leftresult").html(data);
			},
			error:function(data){
				console.log(data);
			}
	});

}
function getright(topic){
	$("#rightbody").empty();
	$.ajax({
			type:"get",
			url:"/right/?menu="+topic,
			dataType:"html",
			beforeSend:function(xhr){
				xhr.setRequestHeader("authorization","Bearer "+sessionStorage.token);
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
