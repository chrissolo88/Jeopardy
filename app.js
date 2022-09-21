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
        $tr.append($('<th>').attr({'scope':'col','class':'bg-primary text-white'}).text(cat.title))
    }
    $titles.append($tr)
    console.log(categories[0].clues.length)
    for (let clueIdx = 0; clueIdx < categories[0].clues.length; clueIdx++) {
        let $tr = $('<tr>');
        for (let catIdx = 0; catIdx < categories.length; catIdx++) {
          $tr.append($("<td>").attr({"id": `${catIdx}-${clueIdx}`,'class':'bg-primary text-white','data-toggle':'modal','data-target':'#qModal'}).text(`$${clueIdx + 1}00`));
        }
        $questions.append($tr)
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const id = evt.target.id;
    const [catId, clueId] = id.split("-");
    const clue = categories[catId].clues[clueId];
  
    let question = clue.question;
    let answer = clue.answer;
  
    // if (!clue.showing) {
    //     question = clue.question;
    //     clue.showing = "question";
    // } else if (clue.showing === "question") {
    //     question = clue.answer;
    //     clue.showing = "answer";
    // } else {
    //     return
    // }
    $('#your-answer').val('')
    // Update text of cell
    $('#answer-btn').removeClass('collapse')
    $('.input-group').removeClass('collapse')
    $('#title-modal').html(`${categories[catId].title} - ${evt.target.innerText}`)
    $(`#question-modal`).html(question);
    $('#answer-btn').on('click',() =>{
        const yourAnswer = $('#your-answer').val()
        console.log(yourAnswer,answer,answer.includes(yourAnswer))
        if(yourAnswer == answer){
            $(`#question-modal`).html(`<p>${answer}</p><p class="text-success">${yourAnswer}</p>`);
            evt.target.classList.add('bg-success')
            evt.target.classList.remove('bg-primary')
        } else {
            $(`#question-modal`).html(`<p>${answer}</p><p class="text-danger">${yourAnswer}</p>`);
            evt.target.classList.add('bg-danger')
            evt.target.classList.remove('bg-primary')
        }
        $('.input-group').addClass('collapse')
        $('#answer-btn').addClass('collapse')

    })
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    categories = [];
    const catIds = await getCategoryIds();
    for(let catId of catIds){
        categories.push(await getCategory(catId));
    };
    fillTable(categories);
};

/** On click of start / restart button, set up game. */
$('#start').on('click', setupAndStart)
// TODO

/** On page load, add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  }
);
// TODO