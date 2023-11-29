---
layout: post
title: 01 Memory Structure
description: >
  stack, heap, static
sitemap: false
hide_last_modified: true
---

# 01 Memory Structure

## 1. Variables in Memory (Stack)

### Stack Memory

```cpp
int main()
{
  int a,b,c;
  double d;

  return 0;
}
```
위 코드를 memory space에서 보면 다음과 같다.

<p align="center">
  <img src="./images/Pasted image 20230218193225.png" align="center" width="98%">
  <figcaption align="center"></figcaption>
</p>

- (top 기준) stack은 top에서 부터 address가 증가하는 방향으로 진행된다. 
- (첫 변수 기준) 처음 할당된 애 기준으로는 address가 감소하는 방향으로 진행된다.
- computer는 변수명을 들고 있지 않고, top에서 부터 몇번째에 위치하는지만을 이해한다.
- unix 기반의 clang, gcc compiler의 경우 memory는 top에서 부터 하나씩 내려오는 방향으로 진행된다.

> 위에 말들이 조금 헷갈릴 수 있지만, 그림을 기억하면 된다.

---
### Variable Types 1 (sizeof)

- Type Size in Memory

```cpp
{
	int a=0;
	std::cout << sizeof(int) << std::endl; // int: 4bytes => 32bits
	std::cout << sizeof(a) << std::endl;
	// integer: short(2), int(4), long(8)
	// float: float(4), double(8)

	static_assert(sizeof(int)!=4, "int is 4bytes") 
  // 위와 같이 int가 환경에 따라 4byte가 맞는지 확인할 수 있다.
	// 또는 int8_t, int16_t, int32_t, int64_t 등을 사용할 수 있다. 습관 들이면 좋을 듯

	//array
	std:array<int,5> b; // 20 byte
	
	return 0;
}
```

---
```cpp
#include <array>
#include <cstdint>
#include <iostream>

int main()
{
	uint64_t ui8;
	float f4;
	std::arrray<uint8_t,5> uia5;

	uint64_t *ui64ptr = &ui8;
	std::cout << sizeof(ui64ptr) << std::endl; //8
	std::cout << (uint64_t)ui64ptr << std::endl; //address
	
	return 0;
}
```

---
### Variables Type 2 (sizeof struct)
> 4 byte로 align 되므로 padding을 생각해서 struct 구성하기 (하드웨어 마다 다름)

```cpp
#include<iostream>

struct ST 
{
	long a; //8bytes
	int b; //4bytes
	short c; //2bytes
}

int main()
{
	std::cout << sizeof(ST) << std::endl; // not 14, 16 bytes
	
	return 0;
}
```

```cpp
#include<iostream>

class Cat
{
pulbic:
	void printCat(); //??? memory는 먹을까? ㄴㄴㄴㄴ
private:
	int age; // 4 bytes
	float weight; // 4 bytes
}

int main()
{
	std::cout << sizeof(Cat) << std::endl; // function은 class size와는 관계가 없다.
	Cat cat1; // 8 bytes
	Cat cat2; // 8 bytes

	Cat* catPtr = &cat1; // 8 bytes (64bit 기준)
	
	return 0;
}
```

- 정리
  - class에서 function은 메모리를 먹지 않는다.
  - pointer, struct, class도 전부 stack에서 메모리를 차지한다.
  - 변수를 선언하는 순서로 stack에 쌓이지 않는다. (stack frame)

---
### Call Stack & Stack Frame

```cpp
void foo()
{
	int a;
	int b;
}
void bar()
{
	Cat cat;
	Dog dog;
}

int main()
{
	int a;
	double b;

	foo();
	bar();

	return 0;
}
```

- 정리
  - stack memory는 변수대로 쌓이는게 아니라 function대로 결정되며 stack frame을 쌓는 식으로 결정된다. stack frame이란 하나의 function의 memory 조합?
  - function call에 의해서 결정, 즉 compiler가 결정한다.
  - stack frame = function + additional info. (argument, return address)

<p align="center">
  <img src="./images/Pasted image 20230218200139.png" align="center" width="98%">
  <figcaption align="center"></figcaption>
</p>

```cpp
class Cat
{
public:
	Cat()
	{
		m_age=1;
	};
	~Cat();
	void addAge(int arg)
	{
		m_age+=arg;
	};
private:
	int m_age;
};

int main()
{
	Cat cat;
	cat.addAge(10);
}
```

- 정리
  - 함수가 호출되면, stack frame이 올라가고, stack frame 내에는 반환주소값, 매개변수값, 지역변수 등이 올라간다. 그리고 함수가 종료되면 stack frame이 사라진다.

*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets
*[JS]: JavaScript
