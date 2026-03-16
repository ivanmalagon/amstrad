---
title: Dev diaries - Week 11 2026
date: 2026-03-16
updated: 2026-03-16
tag: Dev diaries
---

This section is shamelessly stolen from my colleague [Alrocar's](https://x.com/alrocar) dev diaries. It feels like a great excuse to step back and reflect on work during a time when everything moves so fast. Some weeks I can't even remember what I did two days ago. I don't want to do this just from the technical side. I want it to help me see the forest, not the trees.

**TL;DR:** A week of emotional ups and downs that ended well, and a reflection on how ego and fear of being replaceable are shaping the way I see my own work.

## The main thing

Right now I'm working on user activation. Specifically, a revamp of how we generate the prompts a brand monitors. There's an end goal (the prompts), but the really important thing is that the user understands what's happening and can participate in the process. There's a lot of room to make this flow smoother.

## This week's gnawing rat

By Friday I was worried I hadn't made good use of my time. Spoiler: I had. But I wouldn't have reached that conclusion on my own.

I started with one approach on Monday. Then, a conversation with [Miguel][1] pushed me to try something different: a standard UI flow that a user can complete by themselves, but with a conversational agent alongside to help. If you know what you're doing, you fly through it. If it's your first time, you have an expert walking you through the process, not just doing the work for you but explaining the why.

On the technical side, I piggybacked on Miguel's iteration of our "agent building block". We have our way of adding new agents to the app. He was implementing new capabilities, adding human-in-the-loop mechanisms. I grabbed his in-progress work and applied it to what I was testing.

By Tuesday evening I had something working and... it felt completely off. I had built it on top of an existing flow and it felt forced. Something wasn't right.

I was tempted to drop the whole thing. But thinking about why it felt forced, I decided to apply what I'd learned to a new flow instead of an existing one. Green-field.

That changed everything. The experience was much better.

Then on Thursday, [Dani][2] showed up with his own Claude skill for generating prompts. That deflated me a bit. I thought "Why am I building the same thing in the app?" But the skill was badass, so what I actually did was adapt it to my project.

On Fridays, we get together for a trajectory assessment and demos. It was a bit of a rollercoaster for me. Miguel, who had been pushing the agent building block forward, gave an impressive demo that made me think I'd been doing duplicated work and could have been advancing other things.

Then I ran my demo and the doubts cleared. Folks loved it. It has a lot of potential. Time well spent.

Reflecting on it, I think what happened comes down to two things:

- **Looking at my work through the ego.** Every time I had those "am I doing the right thing?" triggers, they were ego attacks. Why am I working on X when Miguel is working on something similar? Why am I building this if Dani can write a Claude skill and make it irrelevant? The real question underneath: where do I stand out? That's not the most productive way to see it. By the end of the week, everyone's work had been improved by our hive mind. We all contributed something that made the others better. It's natural to see your work through the ego (it's YOUR work). But I think the current zeitgeist amplifies it. Which leads to...

- **Paranoia about being replaceable.** The shifting identity of the profession, the (theoretical) speed of shipping, the fear of being replaceable. It all makes the ego heavier. You have to put in extra work to stay grounded and not get swept away by the uncertainty of what comes next.

## Experiments

This week I applied the OpenSpec flow. [Buti][3] had been using it for a while and gave me a quick rundown, but I hadn't tried it yet. Alongside the agent and prompt work, I also implemented an audit log for the prompt monitoring lifecycle, and a prompt respawn operation (which needed the audit log as its foundation). I used OpenSpec for both. Really solid approach.

[1]: https://www.linkedin.com/in/miguelff/

[2]: https://www.linkedin.com/in/danielespejo/

[3]: https://nobuti.com/
