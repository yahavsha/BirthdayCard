Vue.component('card-item-one', {
  template: `<section>
            <p class="signed">Dear Sheren,</p>
            <p>I'm so excited that I can write to you for your birthday <i class="em em-cake"></i>! First of all, I would like to take this wonderful opportunity to tell you how much I appreciate our friendship and you personally!</p>
            <p>It's important to me to tell you that I think you are amazing, warm, loving, talented, intelligent and interesting person. You are an amazing friend and I appreciate and treassure our friendship so much!</p>
            <p>I'm really lucky that I can be your friend, talk to you about so many things on a variety of topics, enjoy with you and generally be with you <i class="em em-smile"></i>. I admire you and always enjoy being in your company, listen to you, hang with you and learn from you.</p>
            <p>The truth is that from the very first day we met, I was really excited that I had met someone so interesting and nice like you, and as time went on, these feelings only increased in me. A sense of excitement and joy for each conversation, letter and letter.</p>
          </section>`
});

Vue.component('card-item-two', {
  template: `<section>
          <p>The more we talked, the more we discovered how similar we were in so many different subjects and during the conversation I saw again and again some interesting things I can learn from you!</p>
          <p>And, Hey, it does make total sense we've seen the number of subjects we could talk about in our long letters-that I enjoyed reading and writing so much <i class="em em-lower_left_ballpoint_pen"></i>! It really filled me with joy <i class="em em-smile"></i>!</p>
          <p>Our conversations always encourage me, give me warmth, motivation, great joy, and generally help me to be a better person.
          <p>I really enjoy talking to you about everything - about general subjects like anime, books, music, different cultures, politics, food, recipes, <strong>chocolate</strong> (you know he deserves to be counted alone, lol <i class="em em-chocolate_bar"></i><i class="em em-chocolate_bar"></i><i class="em em-chocolate_bar"></i><i class="em em-smile"></i>), holidays; And on more personal subjects, such as the past, what we do every day or our expectations for the future. I feel you're a really supportive shoulder for me, and I really hope you feel the same way for me.</p>
        </section>`
});

Vue.component('card-item-three', {
  template: `<section>
            <p>Thank you so much for introducing me to so many new and amazing things - like new books <i class="em em-books"></i>, anime, music - all of which made me very happy, excited and gave me inspiration!</p>
            <p class="final-words">I have to tell you that always when I'm sad, it's hard for me, or I worry too much (and it happens quite a lot), chatting with you or reading your letters makes me really happy! You're like a ray of sunlight for me and for everyone!</p>
            <p class="final-words">Finally, I would like to take the opportunity to tell you that I want to be always here for you and support you!</p>
            <p class="final-words">I wish you a happy and charming birthday, full of success, joy and happiness! Stay as amazing as you!</p>
            <p class="signed">Happy Birthday!</p>
            <p class="signed">Loves A lot&nbsp;&nbsp;<i class="em em-heart">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, </i><br />Yahav</p>
         </section>`
});

Vue.component('card', {
  template: `<div id="card" v-bind:class="{ 'opend': [0, 3].indexOf(this.state) == -1,
                                        'open-half' : this.state == 1,
                                        'open-fully': [2, 4, 5, 6, 7].indexOf(this.state) != -1,
                                        'close-half' : this.state == 3,
                                        'inside-open-half' : this.state == 4,
                                        'inside-open-fully' : this.state == 5,
                                        'inside-close-half' : this.state == 6,
                                        'inside-close-full' : this.state == 7  }">
          <div v-bind:class="{ 'card-inside': true, 'notransition': this.bypassTransitions, 'back-rotation': this.backRotation }">
            <div class="wrap" v-show="[4, 5, 7].indexOf(this.state) != -1">
              <component v-bind:is="nextItem"></component>
              <button v-show="showNextButtonForNext" :disabled="this.inTransition" @click="onNext">&gt;</button>
            </div>
          </div>
          <div v-bind:class="{ 'card-inside': true, 'notransition': this.bypassTransitions }">
            <div class="wrap" v-show="this.state != 5">
              <component v-bind:is="selectedItem"></component>
              <button v-show="showNextButton" :disabled="this.inTransition" @click="onNext">&gt;</button>
            </div>
          </div>
          
          <div class="card-front">
              <div class="wrap">
                <translated-cover></translated-cover>
                <button v-show="showOpenButton" :disabled="this.inTransition" @click="opFlipCover">&gt;</button>
                <button v-show="showPrevButton" :disabled="this.inTransition" @click="onPrevious">&gt;</button> 
              </div>
          </div>
      </div>`,

  props: {
      showOpenButton: false,
      showPrevButton: false,
      switchingPage: false,
      bypassTransitions: false,
      backRotation: false,
      inTransition: false
  },

  created: function() {
      /**
       * States:
       *    0: Shows the cover page.
       *    1: Moving from cover page to the first page (0% to 50%).
       *    2: Moving from cover page to the first page (50% to 100%). Default.
       *    3: Moving from first page to cover page (0% to 50%). No need for 50% to 100% as no css class will just negate the state1 effect and do it.
       *    4: Moving n'th page to (n + 1)'th page (0% to 50%).
       *    5: Moving n'th page to (n + 1)'th page (50% to 100%). Then you should be moving back to the 2nd state.
       *    6: Moving (n + 1)'th page to n'th page (0% to 50%).
       *    7: Moving (n + 1)'th page to n'th page (50% to 100%). Then you should be moving back to the 2nd state.
       */
      this.state = 0;
      this.selectedIndex = -1;
      this.timer = undefined;
      this.items = this.$slots;
      this.showOpenButton = true;
      this.items = this.$slots.default.filter(function(item) {
          return item.tag ? item.tag.includes('card-item') : false;
      });
  },

  computed: {
      selectedItem: {
          cache: false,
          get: function() {
              if (this.selectedIndex == -1) {
                  return this.items[0].componentOptions.tag;
              }

              return this.items[this.selectedIndex].componentOptions.tag;
          }
      },

      nextItem: {
          cache: false,
          get: function() {
              /* We meed to decide if the next item is the "next" or the "previous".
                To do that, we'll check the state value */
              var incValue = 1; // By default, the next is the actual next (a.k.a., n + 1).
              if (this.state == 7) {
                  // We're going backwards
                  incValue = -1;
              }

              if (this.selectedIndex + incValue < 0 || this.selectedIndex + incValue >= this.items.length) {
                  return '';
              }

              return this.items[this.selectedIndex + incValue].componentOptions.tag;
          }
      },

      showNextButton: {
          cache: false,
          get: function() {
              if (this.state == 0) {
                  return false; // We have a default button there.
              }

              return this.selectedIndex < this.items.length - 1;
          }
      },

      showNextButtonForNext: {
          cache: false,
          get: function() {
              if (this.state == 0) {
                  return false; // We have a default button there.
              }

              if (this.state == 4 || this.state == 5 || this.state == 2) {
                  // We're moving to the next page, so we need to simulate n = n+1.
                  return this.selectedIndex + 1 < this.items.length - 1;
              }

              return this.selectedIndex < this.items.length - 1;
          }
      },

      showPrevButton: {
          cache: false,
          _value: false,
          get: function() {
              return this.state != 0;
          },
          set: function(value) {
              this._value = value;
          }
      }
  },

  methods: {
      opFlipCover: function() {
          this.selectedIndex = 0;
          this.__performFlip(1, 2);
      },

      onNext: function() {
          this.__performFlip(4, 5, function() {
              this.updateBackground(this.selectedIndex + 1);
          }.bind(this), function() {
              this.bypassTransitions = true;
              this.state = 2;
              this.selectedIndex++;
              this.$forceUpdate();
              setTimeout(function() { // If we won't use a timer, the transition will ignore our instruction
                  this.bypassTransitions = false;
              }.bind(this), 500);
          }.bind(this));
      },

      onPrevious: function() {
          /* Should we close the card or move page backwards? */
          if (this.selectedIndex == 0) {
              this.selectedIndex = -1;
              this.__performFlip(3, 0);
          } else {
              /* Firstly, lets back-rotate our temp */
              this.bypassTransitions = true;
              this.backRotation = true;
              this.$forceUpdate();
              setTimeout(function() { // If we won't use a timer, the transition will ignore our instruction
                  // Now, when we're in the right direction, we can flip-flop!
                  this.backRotation = false;
                  this.bypassTransitions = false;

                  this.__performFlip(6, 7, function() {
                      this.updateBackground(this.selectedIndex - 1);
                  }.bind(this), function() {
                      this.bypassTransitions = true;
                      this.state = 2;
                      this.selectedIndex--;
                      setTimeout(function() { // If we won't use a timer, the transition will ignore our instruction
                          this.bypassTransitions = false;
                          this.$forceUpdate();
                      }.bind(this), 500);
                  }.bind(this));
              }.bind(this), 100);
          }
      },

      __performFlip: function(middleStatus, endStatus, middleCallback, endCallback) {
          if (this.timer) {
              clearTimeout(this.timer);
          }

          /* Move the state to the half flip */
          this.state = middleStatus;
          this.$forceUpdate();

          this.inTransition = true; // This disables the button till we finish
          this.timer = setTimeout(function() {
              /* Execute the middle callback if we need to */
              if (middleCallback) {
                  middleCallback();
              } else { // If there's a middle callback, it's responsible of the background.
                  /* Update the background */
                  this.updateBackground();
              }

              /* Finalize */
              this.state = endStatus;
              this.timer = setTimeout(function() {
                  if (endCallback) {
                      endCallback();
                  }
                  this.inTransition = false;
                  this.timer = null;
              }.bind(this), 1000);
              this.$forceUpdate();
          }.bind(this), 1000);
      },

      updateBackground: function(itemIndex) {
          if (itemIndex == undefined) {
              itemIndex = this.selectedIndex;
          }
          var backgroundImageUrl = '';
          if (itemIndex > -1) {
              backgroundImageUrl = "./images/" + this.items[itemIndex].data.attrs['bg'];
          }

          if (backgroundImageUrl != '') {
              document.getElementsByTagName("html")[0].style = "background-image: url(" + backgroundImageUrl + ")";
          } else {
              document.getElementsByTagName("html")[0].style = '';
          }
      }
  }
});

Vue.component('present-box', {
  props: ['to'],
  template: `<div class="box-folding-wrapper">
          <section v-show="this.isOpen" v-bind:class="{ open: this.isOpen }">
            <slot></slot>
          </section>
          <section class="box-folding">
          <div class="present-wrapper">
              <div id="present" v-bind:class="{ 'present-box': true, open: this.isOpen }" v-on:click.once="onClick">
                <div class="present">
                    <div class="img-wrap" id="present-image">
                      
                    </div>
                </div>
                <div class="side front"></div>
                <div class="side back"></div>
                <div class="side left"></div>
                <div class="side right"></div>
                <div class="side top">
                    <span class="to">
                    <span class="name" id="nametag">To {{ to }}</span>
                    </span>
                </div>
                <div class="side bottom"></div>
              </div>
          </div>
          <p class="info-text" v-show="!this.isOpen" >Click to See Inside</p>
          <p class="info-text" v-show="this.isOpen" >Put the Cursor on the Card to Read</p>
        </section>
        </div>`,

  data: {
      isOpen: false
  },

  created: function() {
      this.isOpen = false;
  },

  methods: {
      onClick: function() {
          this.isOpen = true;
          this.$forceUpdate();
      }
  }
});

Vue.component('translated-cover', {
  template: '<transition name="fade" mode="in-out">' +
      '<h1 v-if="show" key="1">{{ content }}</h1>' +
      '<h1 v-else key="2">{{ content }}</h1>' +
      '</transition>',

  created: function() {
      this.translations = [
          'Happy Birthday!',
          'Alles Gute zum Geburtstag!',
          'お誕生日おめでとうございます!',
          '生日快乐!',
          '생일 축하!',
          'מזל טוב!',
          'с Днем рожденья!',
          'Bon anniversaire!',
          'buon compleanno!'
      ];
      this.index = 0;
      this.content = this.translations[(this.index++ % this.translations.length)];
      this.show = true;

      var updateTranslation = function() {
          this.content = this.translations[(this.index++ % this.translations.length)];
          this.show = !this.show;

          this.$forceUpdate();

          Vue.nextTick(function() {
              setTimeout(updateTranslation.bind(this), 3000);
          }.bind(this));
      };

      updateTranslation.bind(this)();
  }
});