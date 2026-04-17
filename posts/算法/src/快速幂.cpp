#include<iostream>
using namespace std;
int main(){
    double x,res = 1;
    long long n;
    cout << "底数x:" << endl;
    cin >> x;
    cout << "指数n:" << endl;
    cin >> n;
    if(n < 0){
        x = 1.0/x;
        n = -n;
    }

    while(n != 0){
        if( n % 2 == 0){
            x = x*x;
            n /= 2;
        }
        else{
            res *= x;
            n -= 1;
        }
    }
    cout << res;
    return 0;
}