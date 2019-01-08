window.onload = init;

function init() {
    new QualityBall({
        type: 'yellow',
        submit: function(question, questionImgs) {
            console.log(question, questionImgs);
        }
    });
}

var $btn = document.querySelector('#btn');
$btn.addEventListener('click', function(){
    console.log('clicked me');
}, false);