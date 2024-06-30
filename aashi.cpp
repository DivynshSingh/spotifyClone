#include<iostream>
#include<stdc++.h>
using namespace std;

pair<int, int> finder(int &tasks){
if(tasks==1)return pair<int, int>(1,1);
pair<int, int> ans;
ans.first=0;
ans.second=0;
int low=0, high=tasks;
//mid represents level number
while(low<=high){
    int mid=(low+high)/2;
    int prevTasks=(mid*(mid-1));
    prevTasks/=2;
    if(tasks>=prevTasks){
        if(tasks < prevTasks+mid){
            ans.first=mid;
            // cout<<mid;
            ans.second=(mid+prevTasks)-tasks;
            break;
        }else{
            low=mid+1;
        }
    }else{
        high=mid-1;
    }
}
return ans;
}
int main(){
    int tasks;
    cin>>tasks;
    pair<int, int> ans;
    ans=finder(tasks);
    cout<<ans.first<<", ";
    cout<<ans.second;
    return 0;
}