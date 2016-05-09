using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using DAQ;
using SharedCode;


namespace EDMPlotter
{
    public class Experiment
    {
        #region Declarations, constructors, accessors
        private readonly static Lazy<Experiment> _instance = new Lazy<Experiment>(() => new Experiment(GlobalHost.ConnectionManager.GetHubContext<PlotHub>().Clients));


        DataSet dataSet;
		ExperimentParameters parameters;
        enum ExperimentState { IsStopped, IsStarting, IsRunning, IsFinishing}
        ExperimentState es; //What's the meanning of es ?

        object keepRunningCheckLock = new object();
        
        Thread experimentThread;

		IExperimentHardware hardware;

        public Experiment(IHubConnectionContext<dynamic> clients)
        {
            Clients = clients;

			hardware = new DAQmxTriggeredMultiAIHardware();
			//hardware = new FakeHardware();

            es = ExperimentState.IsStopped;
            Clients.All.toConsole("Experiment is ready.");
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
        public void StartExperiment(string jsonParams)
        {
            if (es.Equals(ExperimentState.IsStopped))
            {

                es = ExperimentState.IsStarting;
                Clients.All.toConsole("User issued start command. Starting...");
                initialiseExperimentalParameters(jsonParams);

                experimentThread = new Thread(new ThreadStart(run));
                experimentThread.Start();

                es = ExperimentState.IsRunning;
                Clients.All.toConsole("Running Experiment...");

                //Data should be coming in here; As fake data, generate a point every 0.5 seconds.
            }
        }
        public void StopExperiment()
        {
            Clients.All.toConsole("User issued stop command. Stopping...");
            if (experimentThread != null)
            {
                es = ExperimentState.IsFinishing;
                experimentThread.Join();
            }
            es = ExperimentState.IsStopped;
            Clients.All.toConsole("Experiment stopped.");
        }

        public void Clear()
        {
            Clients.All.toConsole("User issued clear command. Clearing...");
            if (es.Equals (ExperimentState.IsStopped)) {
				Clients.All.clearData ();
                Clients.All.toConsole("Cleared.");
            }
            else
            {
                Clients.All.toConsole("Cannot clear data. Experiment is still running.");
            }
        }
        public void Save(string path)
		{
            Clients.All.toConsole("User issued save command. Saving to: " + path);
            if (es.Equals (ExperimentState.IsStopped)) {
				saveData(path);
                Clients.All.toConsole("Data Saved.");
            }
            else
            {
                Clients.All.toConsole("Cannot save data. Experiment is still running.");
            }
            
        }

        #endregion

        #region RUN
        void run()
        {
            Clients.All.toConsole("Initialising hardware.");
            hardware.Initialise (parameters);

            Clients.All.toConsole("Running...");
            dataSet = hardware.Run ();

            Clients.All.toConsole("Experiment completed. Sending data...");
            //Push data down to the client like this.
            Clients.All.pushData(dataSet.ToJson());
            Clients.All.toConsole("Complete. Disposing hardware parameters...");
            hardware.Dispose();
            Clients.All.toConsole("Disposed. Click \"stop\" to finalise.");
        }
        #endregion

        #region private 

        void saveData(string path)
        {
            try {
                //To CSV
                dataSet.SaveCSV(path);
            }
            catch (IOException e)
            {
                Console.WriteLine(e.Message);
            }
        }

        void initialiseExperimentalParameters(string jsonParams)
        {

            try {
                parameters = JsonConvert.DeserializeObject<ExperimentParameters>(jsonParams);
            }
            catch (JsonException e)
            {
                Console.WriteLine(e.Message);
                Console.WriteLine("Loading default values.");
                jsonParams = @"{
            'NumberOfPoints': '1000',
            'AINames': ['x_val', 'y_val', 'y_val1', 'y_val2'],
            'AIAddresses': ['/dev1/ai1', '/dev1/ai2', '/dev1/ai3', '/dev1/ai4'],
            'AutoStart': 'false',
            'TriggerAddress': '/dev1/PFI0',
            'SampleRate': '200'
            }";
                parameters = JsonConvert.DeserializeObject<ExperimentParameters>(jsonParams);
            }


        }

    }
    #endregion
}