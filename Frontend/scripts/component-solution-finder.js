XA.component.SolutionFinder = (function ($) {

    var api = {};
    api.init = function () {


        const jsondata = document.getElementById("finderdata");

        var CookieHelper = {

            setCookie: function (cookieName, cookieValue, expiresInDays) {
                var currentDate = new Date();
                var expires = "";

                // If no expiration is passed, don't use it
                if (expiresInDays) {
                    currentDate.setTime(currentDate.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
                    expires = ";expires=" + currentDate.toUTCString();
                }

                document.cookie = cookieName + "=" + cookieValue + expires;
            }

            /// Gets the values in a cookie.  
            /// Returns an empty string if cookie does not exist.
            , getCookie: function (cookieName) {
                var name = cookieName + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }
        }



        window.onhashchange = function () {
            // Tracks Browser history button clicks   
            // loadimages()
            if (location.hash.length > 0) {
                let questionIndex = parseInt(location.hash.substring(1));
                // Make sure it doesn't update twice in a row.
                if ((isNaN(questionIndex) == false) && (SolutionFinder.currentQuestion != questionIndex)) {
                    SolutionFinder.goBack(questionIndex, imgresult);
                }
            }
        }



        let imgresult = function loadimages() {

            $('.answer-image').each(function () {
                var imagesrc = $(this).attr("src");
                imagesrc = imagesrc.slice(3)
                // console.log(imagesrc)

                $(this).attr("src", imagesrc);
            })

        }

        var SolutionFinder = {
            currentAnswers: []
            , answerHistory: []
            , debug: false
            , currentQuestion: 0
            , $display: null
            , $animatedDisplay: null
            , $breadCrumb: null
            , breadcrumbTemplate: ''
            , questionTemplate: ''
            , answerTemplate: ''
            , data: null
            , init: function (breadCrumbTemplate, questionTemplate, answerTemplate, questionData, loadimg) {
                // Find JQuery elements
                SolutionFinder.$display = $("#SolutionFinderDisplay");
                SolutionFinder.$animatedDisplay = $("#AnimatedDisplay");
                SolutionFinder.$breadCrumb = $("#SolutionFinderBreadCrumbs");
                if (this.debug) { console.log("Data Received:", questionData); }

                var jsonData = JSON.parse(questionData);

                if (this.debug) { console.log("Data converted to JSON:", jsonData); }

                SolutionFinder.data = jsonData;

                // Load templates
                SolutionFinder.questionTemplate = questionTemplate; //SolutionFinder.getQuestionTemplate();
                SolutionFinder.answerTemplate = answerTemplate; //SolutionFinder.getAnswerTemplate();
                SolutionFinder.breadcrumbTemplate = breadCrumbTemplate; //SolutionFinder.getBreadCrumbTemplate();

                // Bind event when user clicks on an answer
                SolutionFinder.$display.on("click", ".answer-div", function () {
                    SolutionFinder.answerClicked($(this), imgresult);
                });

                // Bind event when user clicks breadcrumb
                SolutionFinder.$breadCrumb.on("click", ".solution-finder-breadcrumb", function () {
                    SolutionFinder.breadCrumbClicked($(this), imgresult);
                });

                SolutionFinder.loadAnswersFromCookie();
                if (SolutionFinder.currentAnswers.length == 0) {
                    SolutionFinder.run();

                }
                loadimg();
            }
            , answerClicked: function ($answer, loadimg) {
                var answer = $answer.attr("answer");
                var title = $answer.attr("title");
                var questionId = $answer.attr("questionId");
                var breadcrumb = $answer.attr("breadcrumb");
                var questionBreadcrumb = $answer.attr("questionBreadcrumb");
                var doesQuestionExist = false
                var link = $answer.attr("link");
                var textOverride = $answer.attr("textOverride");

                if (this.debug) {
                    console.log("Answer selected", questionId + ': ' + answer);
                }

                for (var i = 0; i < SolutionFinder.currentAnswers.length; i++) {
                    if (SolutionFinder.currentAnswers[i].QuestionId == questionId) {
                        // Update existing answer to the new answer value
                        SolutionFinder.currentAnswers[i].Answer = answer;
                        doesQuestionExist = true;
                    }
                }

                // If answer doesn't already exist create a new one
                if (doesQuestionExist == false) {
                    SolutionFinder.currentAnswers.push({
                        QuestionId: questionId
                        , Answer: answer
                        , AnswerTitle: title
                        , QuestionIndex: SolutionFinder.currentQuestion
                        , Breadcrumb: breadcrumb
                        , QuestionBreadcrumb: questionBreadcrumb
                    })
                }

                // If there is a link, then load that url
                // otherwise continue with the next question
                if (link != '') {
                    SolutionFinder.saveAnswersToCookie();
                    window.location.href = link;
                }
                else {
                    // Load the next question
                    SolutionFinder.advanceQuestion(textOverride);
                }

                if (this.debug) {
                    console.log("New answers", SolutionFinder.currentAnswers);
                }
                loadimg();
            }
            , breadCrumbClicked: function ($crumb, loadimg) {
                var index = $crumb.attr("questionIndex");

                SolutionFinder.selectQuestion(index);
                loadimg();
            }
            , clearAnswers: function (fromIndex) {
                var newAnswers = [];

                fromIndex = parseInt(fromIndex);

                if (this.debug) { console.log("Trim answers", fromIndex); }
                if (this.debug) { console.log("Current Answers before trim", SolutionFinder.currentAnswers); }

                for (var i = 0; i < SolutionFinder.currentAnswers.length; i++) {
                    if (SolutionFinder.currentAnswers[i].QuestionIndex < fromIndex) {
                        newAnswers.push({
                            QuestionId: SolutionFinder.currentAnswers[i].QuestionId
                            , Answer: SolutionFinder.currentAnswers[i].Answer
                            , AnswerTitle: SolutionFinder.currentAnswers[i].AnswerTitle
                            , QuestionIndex: SolutionFinder.currentAnswers[i].QuestionIndex
                            , Breadcrumb: SolutionFinder.currentAnswers[i].Breadcrumb
                            , QuestionBreadcrumb: SolutionFinder.currentAnswers[i].QuestionBreadcrumb
                        })
                    }
                }

                SolutionFinder.currentAnswers = newAnswers;

                if (this.debug) {
                    console.log("Current Answers after trim", SolutionFinder.currentAnswers);
                }
            }
            , run: function () {
                SolutionFinder.selectQuestion(0);
                // loadimg();  

            }
            , goBack(questionIndex, loadimg) {
                // Used by Browser history buttons
                this.currentAnswers = this.answerHistory.pop();
                this.selectQuestion(questionIndex);
                loadimg();
            }
            , selectQuestion: function (questionIndex, textOverride) {
                // Used for back button navigation
                location.hash = questionIndex;
                this.answerHistory.push(this.currentAnswers);

                // Make sure index is an integer
                questionIndex = parseInt(questionIndex);

                var isQuestionAdvancing = !(SolutionFinder.currentQuestion > questionIndex);

                SolutionFinder.clearAnswers(questionIndex);

                SolutionFinder.currentQuestion = questionIndex;
                if (this.debug) {
                    console.log('selecting question: ' + questionIndex);
                }
                var question = SolutionFinder.data.questions[questionIndex];

                if (this.debug) {
                    console.log('question selected', question);
                }

                SolutionFinder.refreshBreadCrumbs();

                var displayText = SolutionFinder.bindQuestion(question, textOverride);
                SolutionFinder.slide(displayText, isQuestionAdvancing);

            }
            , advanceQuestion: function (textOverride) {
                SolutionFinder.jumpToQuestion(1, textOverride);
            }
            , jumpToQuestion: function (numberOfQuestionsToAdvance, textOverride) {
                var newQuestionIndex = SolutionFinder.currentQuestion + numberOfQuestionsToAdvance;
                var question;
                var numberOfValidQuestions = 0;

                if (SolutionFinder.data.questions.length <= newQuestionIndex) {
                    if (this.debug) { console.log('Unable to load the next question.  No further questions with valid answers found'); }
                    return;
                }

                question = SolutionFinder.data.questions[newQuestionIndex];

                for (var i = 0; i < question.answers.length; i++) {
                    var currentAnswer = question.answers[i];
                    if (SolutionFinder.shouldShowAnswer(currentAnswer)) {
                        numberOfValidQuestions++;
                    }
                }

                if (numberOfValidQuestions > 0) {
                    SolutionFinder.selectQuestion(newQuestionIndex, textOverride);
                }
                else {
                    if (this.debug) {
                        console.log('Question ' + newQuestionIndex + 'skipped as no valid answers were found', question);
                    }
                    SolutionFinder.jumpToQuestion(numberOfQuestionsToAdvance + 1, textOverride);
                }
            }
            , bindQuestion: function (question, textOverride) {
                var templateInstance = SolutionFinder.questionTemplate;
                var answersInstance = '';
                var answerOverrideTemplate = '';

                if (question.overrideQuestionTemplate && question.overrideQuestionTemplate.text) {
                    templateInstance = question.overrideQuestionTemplate.text;
                }

                if (question.overrideAnswerTemplate && question.overrideAnswerTemplate.text) {
                    answerOverrideTemplate = question.overrideAnswerTemplate.text;
                }

                templateInstance = templateInstance.replace('[QuestionTitle]', question.title);

                // If there is an explicit text override then replace the question text with it
                if (textOverride && textOverride != '') {
                    templateInstance = templateInstance.replace('[QuestionText]', textOverride);
                }
                else {
                    templateInstance = templateInstance.replace('[QuestionText]', question.text);
                }

                for (var i = 0; i < question.answers.length; i++) {
                    var templateInstanceAnswer = SolutionFinder.bindAnswer(question.answers[i], question.id, answerOverrideTemplate, question.breadcrumb);
                    answersInstance += templateInstanceAnswer;
                }

                templateInstance = templateInstance.replace('[Answers]', answersInstance);

                return templateInstance;
            }
            , bindAnswer: function (answer, questionId, answerOverrideTemplate, questionBreadcrumb) {
                var templateInstance = SolutionFinder.answerTemplate;
                var title = '';
                var text = '';
                var image = '';
                var link = '';
                var textOverride = '';
                var breadcrumb = '';
                var tooltip = '';

                if (answerOverrideTemplate) {
                    templateInstance = answerOverrideTemplate;
                }

                // If the question shouldn't be shown, then return an empty string
                if (SolutionFinder.shouldShowAnswer(answer) == false) {
                    if (this.debug) { console.log('Answer should not be shown', answer); }
                    return '';
                }

                if (answer.title) {
                    title = answer.title;
                }

                if (answer.text) {
                    text = answer.text;
                }

                if (answer.image) {
                    image = answer.image;
                }

                if (answer.link) {
                    link = answer.link;
                }

                if (answer.breadcrumb) {
                    breadcrumb = answer.breadcrumb;
                }

                if (answer.tooltip) {
                    tooltip = answer.tooltip;
                }

                if (answer.overrideNext && answer.overrideNext.text) {
                    textOverride = answer.overrideNext.text;
                }

                templateInstance = templateInstance.replace('[AnswerText]', text);
                templateInstance = templateInstance.replace('[AnswerTitle]', title);
                templateInstance = templateInstance.replace('[AnswerTitle]', title);  // Duplicated because AnswerTitle appears twice
                templateInstance = templateInstance.replace('[Breadcrumb]', breadcrumb);
                templateInstance = templateInstance.replace('[QuestionBreadcrumb]', questionBreadcrumb);
                templateInstance = templateInstance.replace('[AnswerImage]', image);
                templateInstance = templateInstance.replace('[Answer]', answer.answer);
                templateInstance = templateInstance.replace('[QuestionId]', questionId);
                templateInstance = templateInstance.replace('[Link]', link);
                templateInstance = templateInstance.replace('[TextOverride]', textOverride);
                templateInstance = templateInstance.replace('[TooltipText]', tooltip);

                return templateInstance;
            }
            , bindBreadCrumbs: function () {
                var newBreadCrumbs = "";

                for (var i = 0; i < SolutionFinder.currentAnswers.length; i++) {
                    var currentAnswer = SolutionFinder.currentAnswers[i];
                    var templateInstance = SolutionFinder.breadcrumbTemplate;

                    var questionIndex = '';
                    var questionTitle = '';
                    var answerTitle = '';

                    questionTitle = currentAnswer.QuestionId;
                    if (currentAnswer.QuestionBreadcrumb) {
                        questionTitle = currentAnswer.QuestionBreadcrumb;
                    }
                    answerTitle = currentAnswer.AnswerTitle;
                    if (currentAnswer.Breadcrumb) {
                        answerTitle = currentAnswer.Breadcrumb;
                    }
                    questionIndex = currentAnswer.QuestionIndex;

                    if (this.debug) { console.log("Binding questionIndex", questionIndex); }

                    templateInstance = templateInstance.replace('[QuestionIndex]', questionIndex);
                    templateInstance = templateInstance.replace('[QuestionTitle]', questionTitle);
                    templateInstance = templateInstance.replace('[AnswerTitle]', answerTitle);

                    newBreadCrumbs += templateInstance;
                }

                return newBreadCrumbs;
            }
            , refreshBreadCrumbs: function () {
                var newBreadCrumbs = SolutionFinder.bindBreadCrumbs();

                SolutionFinder.$breadCrumb.html(newBreadCrumbs);
            }
            , shouldShowAnswer: function (answer) {
                var validAnswers = SolutionFinder.hasRequiredAnswers(answer);
                var excludedAnswers = SolutionFinder.hasExcludedAnswer(answer);

                // If valid answers are missing then don't show the question
                if (!validAnswers) {
                    return false;
                }

                // If excluded answers are found then don't show the question
                if (excludedAnswers) {
                    return false;
                }

                return true;
            }
            , hasRequiredAnswers: function (answer) {
                // If there are no requirements then the answer should be shown
                if (answer.requiresAnswer) {

                    // Loop through all the requirements
                    for (let requirementIndex = 0; requirementIndex < answer.requiresAnswer.length; requirementIndex++) {
                        var isConditionMet = false;
                        var currentQuestionId = answer.requiresAnswer[requirementIndex].question;
                        var currentValidAnswers = answer.requiresAnswer[requirementIndex].validAnswers

                        // Get each possible valid answer for the current Requirement
                        for (let currentValidAnswerId = 0; currentValidAnswerId < currentValidAnswers.length; currentValidAnswerId++) {
                            var currentValidAnswer = currentValidAnswers[currentValidAnswerId];

                            // Loop through each answer the user has already given
                            for (let currentAnswerIndex = 0; currentAnswerIndex < SolutionFinder.currentAnswers.length; currentAnswerIndex++) {
                                var currentChosenAnswer = SolutionFinder.currentAnswers[currentAnswerIndex];

                                // If the customer answer to selected question with a valid answer then the condition is met
                                if (currentChosenAnswer.QuestionId == currentQuestionId && currentChosenAnswer.Answer == currentValidAnswer) {
                                    isConditionMet = true;
                                }
                            }
                        }

                        // If the user hasn't supplied one of the required answers then skip further processing and return false
                        if (isConditionMet == false) {
                            return false;
                        }
                    }
                }

                // If no conidtions failed then all of them must have passed
                return true;
            }
            , hasExcludedAnswer: function (answer) {
                // If there are no requirements then the answer should be shown
                if (answer.excludeAnswer) {
                    if (this.debug) { console.log('answer has Exclusions', answer); }

                    // Loop through all the requirements
                    for (let requirementIndex = 0; requirementIndex < answer.excludeAnswer.length; requirementIndex++) {
                        var isConditionMet = false;
                        var currentQuestionId = answer.excludeAnswer[requirementIndex].question;
                        var currentExcludedAnswers = answer.excludeAnswer[requirementIndex].excludedAnswers

                        // Get each possible valid answer for the current Requirement
                        for (let currentExcludedAnswerId = 0; currentExcludedAnswerId < currentExcludedAnswers.length; currentExcludedAnswerId++) {
                            var currentExcludedAnswer = currentExcludedAnswers[currentExcludedAnswerId];

                            // Loop through each answer the user has already given
                            for (let currentAnswerIndex = 0; currentAnswerIndex < SolutionFinder.currentAnswers.length; currentAnswerIndex++) {
                                var currentChosenAnswer = SolutionFinder.currentAnswers[currentAnswerIndex];

                                // If the customer answer to selected question with a valid answer then the condition is met
                                if (currentChosenAnswer.QuestionId == currentQuestionId && currentChosenAnswer.Answer == currentExcludedAnswer) {
                                    isConditionMet = true;
                                }
                            }
                        }

                        // If the user has  upplied one of the excluded answers then skip further processing and return true
                        if (isConditionMet == true) {
                            return true;
                        }
                    }
                }

                // If no excluded answers found then return false
                return false;
            }
            , slide: function (newHtml, slideLeft) {
                var startPosition;
                var endPosition;
                var oldHtml = SolutionFinder.$display.html();

                if (slideLeft) {
                    startPosition = '100%';
                    endPosition = '-100%';
                }
                else {
                    startPosition = '-100%';
                    endPosition = '100%';
                }

                SolutionFinder.$animatedDisplay.html(oldHtml);
                SolutionFinder.$animatedDisplay.css({ 'left': '0px' })
                SolutionFinder.$display.css({ 'left': startPosition });
                SolutionFinder.$display.html(newHtml);

                SolutionFinder.$animatedDisplay.animate({ left: endPosition }, 'slow');
                SolutionFinder.$display.animate({ left: '0px' }, 'slow', function () {
                    SolutionFinder.resetSlides(newHtml);
                });
            }
            , resetSlides: function (newHtml) {
                SolutionFinder.$animatedDisplay.html("");
                SolutionFinder.$animatedDisplay.css({ 'left': '0px' })
                SolutionFinder.$display.css({ 'left': '0px' });
            }
            , saveAnswersToCookie: function () {
                var currentAnswers = SolutionFinder.currentAnswers;

                CookieHelper.setCookie("SolutionFinderAnswers", JSON.stringify(currentAnswers));
                CookieHelper.setCookie("SolutionFinderQuestion", SolutionFinder.currentQuestion);

                console.log('Cookie saved as ' + currentAnswers);
            }
            , loadAnswersFromCookie: function () {
                var solutionFinderAnswers = CookieHelper.getCookie("SolutionFinderAnswers");

                if (solutionFinderAnswers != "") {
                    var currentAnswers = JSON.parse(solutionFinderAnswers);

                    console.log("cookie retrieved.  Answers: " + currentAnswers);
                    SolutionFinder.currentAnswers = currentAnswers;
                }

                var solutionFinderQuestion = CookieHelper.getCookie("SolutionFinderQuestion");

                if (solutionFinderQuestion != "") {
                    console.log("cookie retrieved.  Question: " + solutionFinderQuestion);
                    SolutionFinder.currentQuestion = solutionFinderQuestion;
                    SolutionFinder.selectQuestion(solutionFinderQuestion);
                }
            }
        };


        $(document).ready(function () {
            // if (args.IsEditing === true) { return null; }

            // if (this.debug) console.logconsole.log("Arguments received", args);

            // SolutionFinder.init(args.BreadCrumbTemplate, args.QuestionTemplate, args.AnswerTemplate, args.QuestionData);
            if(jsondata){
                SolutionFinder.init(jsondata.getAttribute('data-breadcrumbtemplate'), jsondata.getAttribute('data-questiontemplate'), jsondata.getAttribute('data-answertemplate'), jsondata.getAttribute('data-ux-args'), imgresult);
                // setTimeout(loadimages, 2000);
            }
        });




        window.addEventListener('load', (event) => {

            console.log('page is fully loaded');
        });

    }
    return api;
})(jQuery);

XA.register("SolutionFinder", XA.component.SolutionFinder);