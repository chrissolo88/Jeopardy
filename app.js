// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let pScore = 0

async function getCategoryIds() {
    const NUM_CATEGORIES = 6;
    const res = await axios.get('http://jservice.io/api/random',{params:{count:NUM_CATEGORIES}})
    const catIds = [];
    res.data.forEach(category => {
        catIds.push(category.category_id);
    });
    return catIds;
};


async function getCategory(catId) {
    const NUM_CLUES = 5;
    const randClues = new Set()
    const res = await axios.get('http://jservice.io/api/category',{params:{id:catId}})
    for(let i =0; randClues.size < 5; i++){
        randClues.add(Math.floor(Math.random() * res.data.clues.length))
    };
    const clues = res.data.clues.filter((v,i)=> randClues.has(i))
    const finClues = clues.map((clue) =>({
            question: clue.question,
            answer: clue.answer,
            showing: null
        }))
    return {title:res.data.title,clues:clues}
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(categories) {
    const $titles = $('#titles');
    const $questions = $('#questions');
    let $tr = $('<tr>');
    $titles.empty();
    $questions.empty();
    for(let cat of categories){
        $tr.append($('<th>').attr({'scope':'col','class':'bg-primary text-white text-capitalize font-weight-bold'}).text(cat.title))
    }
    $titles.append($tr)
    console.log(categories[0].clues.length)
    for (let clueIdx = 0; clueIdx < categories[0].clues.length; clueIdx++) {
        let $tr = $('<tr>');
        for (let catIdx = 0; catIdx < categories.length; catIdx++) {
            let $td = $('<td>');
            $td.attr({"id": `${catIdx}-${clueIdx}`,'class':'bg-primary text-white font-weight-bold','data-toggle':'modal','data-target':'#qModal'}).html(`$<span id="score">${clueIdx + 1}00</span>`)
            $td.on("click", handleClick);
            $tr.append($td)
        }
        $questions.append($tr)
    }
    hideLoadingView()
}


function handleClick(evt) {
    const $trgt = $(evt.target).closest('td');
    const [catId, clueId] = $trgt.attr('id').split("-");
    const {question, answer} = categories[catId].clues[clueId];
    $trgt.off('click')
    $('#your-answer').val('')
    $('#close-btn').addClass('collapse')
    $('#answer-btn').removeClass('collapse')
    $('.input-group').removeClass('collapse')
    $('#title-modal').html(`${categories[catId].title} - ${$trgt.text()}`)
    $(`#question-modal`).html(question);
    $('#answer-btn').unbind().click(() =>{
        const yourAnswer = $('#your-answer').val()
        if(yourAnswer == ''){
            return
        } else {
            $trgt.removeClass('bg-primary')
            if(answer.toUpperCase().includes(yourAnswer.toUpperCase())){
                $(`#question-modal`).html(`<p>${answer}</p><p class="text-success">${yourAnswer}</p>`);
                $trgt.addClass('bg-success')
            } else {
                $(`#question-modal`).html(`<p>${answer}</p><p class="text-danger">${yourAnswer}</p>`);
                $trgt.addClass('bg-danger')
            }
            $('#close-btn').removeClass('collapse')
            $('.input-group').addClass('collapse')
            $('#answer-btn').addClass('collapse')
            $trgt.hasClass('bg-success') ? pScore += parseInt($trgt.children('#score')[0].textContent) 
            : $trgt.hasClass('bg-danger') ? pScore -= parseInt($trgt.children('#score')[0].textContent) 
            : pScore;
            $trgt.removeAttr('data-toggle')
            updateScore();
        }
    })

}


const updateScore = () => $('#score').text(pScore)
/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('#start').attr('disabled')
    $('#start').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> | Loading...')
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#start').removeAttr('disabled')
    $('#start').html('New Game')
}

async function setupAndStart() {
    showLoadingView()
    categories = [];
    const catIds = await getCategoryIds();
    for(let catId of catIds){
        categories.push(await getCategory(catId));
    };
    fillTable(categories);
};

/** On click of start / restart button, set up game. */
$('#start').on('click', setupAndStart)



$(async function () {
    setupAndStart();
  }
);
