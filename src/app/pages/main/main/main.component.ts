import { Component, OnInit, EventEmitter, ElementRef } from "@angular/core";
import {
  BehaviorSubject,
  fromEvent,
  range,
  interval,
  of,
  timer,
  Subject,
} from "rxjs";
import {
  map,
  delay,
  throttle,
  repeatWhen,
  tap,
  concatMap,
  repeat,
  takeUntil,
  delayWhen,
  take,
} from "rxjs/operators";
import Papa from "papaparse";
import encoding from "encoding-japanese";

interface Trial {
  count: number;
  displayLetter1: string;
  displayLetter2: string;
  answer: string;
  time: number;
}

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  mode = 3;
  moji1$ = new BehaviorSubject<string>("");
  moji2$ = new BehaviorSubject<string>("");
  inputKey$ = new BehaviorSubject<string>("");
  isPlaying = false;
  isFinished = false;
  onFinish$ = new EventEmitter<any>();
  onTimerStop$ = new EventEmitter<any>();
  count = 0;
  mode1Letters = ["a", ""];
  letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
  ];
  letters4 = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "!",
    "#",
    "$",
    "%",
    "&",
  ];
  passingTime = 0;
  trials: Trial[] = [];
  private sound: HTMLAudioElement = new Audio("assets/sounds/sound.mp3");

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.sound.load();
  }
  start() {
    this.isPlaying = true;
    let decideLetter = () => {};
    let record = (e: KeyboardEvent) => {};
    if (this.mode === 1) {
      decideLetter = () => {
        this.count++;
        this.moji1$.next(this.mode1Letters[0]);
        console.log("display:", this.moji1$.getValue());
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: "",
          answer: e.key,
          time: this.passingTime,
        });
        this.moji1$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 2) {
      decideLetter = () => {
        this.count++;
        // 同じ文字
        if (this.randomInt(2) === 0) {
          const letter = this.letters[this.randomInt(20)];
          console.log("same", letter);

          this.moji1$.next(letter);
          this.moji2$.next(letter);
          console.log("display:", this.moji1$.getValue());
        } else {
          const letter1Idx = this.randomInt(20);
          let letter2Idx = this.randomInt(19);
          if (letter1Idx <= letter2Idx) {
            letter2Idx++;
          }
          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
        }
        console.log("display:", this.moji1$.getValue());
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 3) {
      decideLetter = () => {
        this.count++;
        // 同じ文字
        if (this.randomInt(2) === 0) {
          const letter1Idx = this.randomInt(20);
          const coreNum = letter1Idx % 10;

          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[coreNum + 10 * this.randomInt(2)]);
          console.log("display:", this.moji1$.getValue());
        } else {
          const letter1Idx = this.randomInt(20);
          let letter2Idx;
          do {
            letter2Idx = this.randomInt(20);
          } while (letter1Idx % 10 === letter2Idx % 10);
          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
        }
        console.log(
          `moji1:${this.moji1$.getValue()} moji2:${this.moji2$.getValue()}`
        );
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 4) {
      decideLetter = () => {
        this.count++;
        // 同じ文字
        if (this.randomInt(2) === 0) {
          const letter1Idx = this.randomInt(25);
          const coreNum = letter1Idx % 10;

          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[coreNum + 10 * this.randomInt(2)]);
          console.log("display:", this.moji1$.getValue());
        } else {
          const letter1Idx = this.randomInt(20);
          let letter2Idx;
          do {
            letter2Idx = this.randomInt(20);
          } while (letter1Idx % 10 === letter2Idx % 10);
          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
        }
        console.log(
          `moji1:${this.moji1$.getValue()} moji2:${this.moji2$.getValue()}`
        );
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else {
      this.isPlaying = false;
      this.isFinished = true;
      return;
    }
    of(null)
      .pipe(
        delay(1000),
        // tap(() => this.sound.play()),
        concatMap(() => timer(1000 + Math.random() * 5000)),
        tap(decideLetter),
        // タイム計測開始
        concatMap(() => fromEvent(document, "keyup")),
        // タイム計測終了
        tap(record),
        take(1),
        repeat(3)
      )
      .subscribe(
        (_) => {},
        (_) => {},
        () => {
          this.isPlaying = false;
          this.isFinished = true;
        }
      );
  }
  startCounter() {
    interval(1)
      .pipe(takeUntil(this.onTimerStop$))
      .subscribe((t) => (this.passingTime = t));
  }
  stopCounter() {
    this.onTimerStop$.emit();
  }
  exportCSV() {
    // configの初期値
    const config = {
      delimiter: ",", // 区切り文字
      header: true, // キーをヘッダーとして扱う
      newline: "\r\n", // 改行
    };

    // 区切り文字へ変換
    const delimiterString = Papa.unparse(this.trials, config);

    // blobUrlへの変換
    const strArray = encoding.stringToCode(delimiterString);
    const convertedArray = encoding.convert(strArray, "SJIS", "UNICODE");
    const UintArray = new Uint8Array(convertedArray);
    const blobUrl = new Blob([UintArray], { type: "text/csv" });
    const blob = blobUrl;
    const url = window.URL.createObjectURL(blob);

    const link: HTMLAnchorElement = this.elementRef.nativeElement.querySelector(
      "#csv-download"
    ) as HTMLAnchorElement;
    link.href = url;
    link.download = this.mode + ".csv";
    link.click();
  }
  // 0からn-1までの整数をランダムに出力
  randomInt(num: number) {
    return Math.floor(Math.random() * num);
  }
}
