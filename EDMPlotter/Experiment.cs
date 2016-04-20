using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;


namespace EDMPlotter
{
    public class Experiment
    {
        #region Declarations, constructors, accessors
        private readonly static Lazy<Experiment> _instance = new Lazy<Experiment>(() => new Experiment(GlobalHost.ConnectionManager.GetHubContext<PlotHub>().Clients));


        DataSet dataSet;
        List<ExperimentParameters> allAvailableExperiments;
        enum ExperimentState { IsStopped, IsStarting, IsRunning, IsFinishing}
        ExperimentState es; //What's the meanning of es ?

        object keepRunningCheckLock = new object();
        object updateDataLock = new object();
        Thread experimentThread;

        DAQmxTriggeredMultiAI hardware;

        public Experiment(IHubConnectionContext<dynamic> clients)
        {
            Clients = clients;
            allAvailableExperiments = new List<ExperimentParameters>();
            //When you create a new experiment, add to the list here.
            allAvailableExperiments.Add(new ExperimentParameters("fake experiment"));
            allAvailableExperiments.Add(new ExperimentParameters("other experiment"));

            hardware = new DAQmxTriggeredMultiAI();

            es = ExperimentState.IsStopped;
        }

        public static Experiment Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        private IHubConnectionContext<dynamic> Clients
        {
            get;
            set;
        }
        #endregion


        #region public
        public void StartExperiment()
        {
            if (es.Equals(ExperimentState.IsStopped))
            {

                es = ExperimentState.IsStarting;

                experimentThread = new Thread(new ThreadStart(run));
                experimentThread.Start();

                es = ExperimentState.IsRunning;


                //Data should be coming in here; As fake data, generate a point every 0.5 seconds.
            }
        }
        public void StopExperiment()
        {
            if (experimentThread != null)
            {
                es = ExperimentState.IsFinishing;
                experimentThread.Join();
            }
            es = ExperimentState.IsStopped;
        }
        public void ClearExperiment()
        {
            clearExperiment();
        }
        public void SaveExperiment(string path)
        {
            saveExperiment(path);
        }
        public void GetListOfAvailableExperiments()
        {
            pushListOfExperiments();
        }
        #endregion

        #region RUN
        void run()
        {
            //Run whatever experiment you want here. At the moment, run fake.
            //runFakeExperiment();
            runDAQmxTriggeredMultiAIExperiment();
        }
        #endregion

        #region various experiments
        //Put different kinds of experiments here.
        Random rnd = new Random();
        void runFakeExperiment()
        {
            lock (updateDataLock)
            {
                dataSet.Add(new DataPoint(dataSet.Length, (double)dataSet.Length * dataSet.Length + rnd.Next(-1, 1)));
            }

            updatePlot();

            Thread.Sleep(1000);


            if (keepRunningCheck())
            {
                runFakeExperiment();
            }

        }

        void runDAQmxTriggeredMultiAIExperiment()
        {
            int numberOfPoints = 100;
            dataSet = new DataSet();
            hardware.ConfigureReadAI(numberOfPoints, false);

            runDAQmxTriggerMultiAIExperimentLoop(numberOfPoints);

            hardware.DisposeAITask();
        }
        void runDAQmxTriggerMultiAIExperimentLoop(int numberOfPoints)
        {
            double[,] data = hardware.ReadAI(numberOfPoints);
            
            lock (updateDataLock)
            {
                for (int i = 0; i < numberOfPoints; i++)
                {
                    dataSet.Add(new DataPoint(i, data[0, i]));//;data[0, i], data[1, i]));
                }
            }

            updatePlot();
            /*
            if (keepRunningCheck())
            {
                runDAQmxTriggerMultiAIExperimentLoop(numberOfPoints);
            }*/
            //StopExperiment();
        }

        #endregion

        #region private 
        //Checks if experiment should keep going. Should be Threadsafe.
        bool keepRunningCheck()
        {
            bool _ShouldKeepRunning;
            lock (keepRunningCheckLock)
            {
                if (es.Equals(ExperimentState.IsRunning))
                {
                    _ShouldKeepRunning = true;
                }
                else
                {
                    _ShouldKeepRunning = false;
                }
            }
            return _ShouldKeepRunning;
        }

        void updatePlot()
        {
            //Push data down to the client like this.
            Clients.All.pushData(dataSet.ToJson());
        }

        void pushListOfExperiments()
        {
            string jsonExpTypes = JsonConvert.SerializeObject(allAvailableExperiments.ToArray());
            //This sends a list of available experiments to users.
            Clients.All.pushExperimentList(jsonExpTypes);
        }

        void clearExperiment()
        {
            Clients.All.clearData();
            dataSet = new DataSet();
        }

        void saveExperiment(string path)
        {
            try {
                //To JSON
                //dataSet.SaveJson(path);
                //To CSV
                dataSet.SaveCSV(path);
            }
            catch (IOException e)
            {
                Console.WriteLine(e.Message);
            }
        }
        
    }
    #endregion
}